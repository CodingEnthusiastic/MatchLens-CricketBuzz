from app.config import Settings
import time


class GeminiService:
    def __init__(self, settings: Settings):
        self._client = None
        self.model = settings.gemini_model
        self.status = "not_configured"
        self.last_error: str | None = None
        self.error_kind: str | None = None
        self.error_summary: str | None = None
        if settings.gemini_api_key:
            try:
                from google import genai
                from google.genai import types
                self._client = genai.Client(
                    api_key=settings.gemini_api_key,
                    http_options=types.HttpOptions(timeout=30_000),
                )
                self.status = "configured"
            except ImportError:
                self._client = None
                self.status = "dependency_missing"

    def explain(self, prompt: str) -> str | None:
        if self._client is None:
            return None
        for attempt in range(3):
            try:
                response = self._client.models.generate_content(model=self.model, contents=prompt)
                self.status = "configured"
                self.last_error = None
                self.error_kind = None
                self.error_summary = None
                return response.text
            except Exception as exc:
                self.last_error = str(exc)
                message = self.last_error.lower()
                if "not_found" in message or "not found" in message:
                    self.error_kind = "model_not_found"
                elif "resource_exhausted" in message or "quota" in message or "rate limit" in message or "429" in message:
                    self.error_kind = "quota_or_rate_limit"
                elif "unauthenticated" in message or "permission" in message or "api key" in message:
                    self.error_kind = "authentication_or_permission"
                else:
                    self.error_kind = "provider_request_failed"
                self.error_summary = self.last_error[:300]
                retryable = any(code in message for code in ("503", "unavailable", "429", "rate limit"))
                if not retryable or attempt == 2:
                    self.status = "request_failed"
                    return None
                time.sleep(2**attempt)
        return None
