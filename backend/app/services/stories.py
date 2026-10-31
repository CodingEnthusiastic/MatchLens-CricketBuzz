
from collections import Counter, defaultdict

from app.models import BallEvent, StoryItem
from app.services.cricket import ReplayData


# Detection thresholds. These can be tuned after testing on real matches.
BIG_OVER_RUNS = 12
PARTNERSHIP_MIN_RUNS = 30
MOMENTUM_WINDOW_OVERS = 3
MOMENTUM_CHANGE_THRESHOLD = 3.0


def _delivery_labels(deliveries: list[BallEvent]) -> list[str]:
    """
    Generate proper cricket over labels.

    Cricsheet over numbers are zero-based.
    Only legal deliveries advance the displayed ball count.
    """
    legal_balls = defaultdict(int)
    labels = []

    for event in deliveries:
        if event.is_legal:
            legal_balls[event.over] += 1

        ball_number = legal_balls[event.over]
        labels.append(f"{event.over + 1}.{ball_number}")

    return labels


def detect_wickets(
    deliveries: list[BallEvent],
    labels: list[str],
) -> list[StoryItem]:
    stories = []

    for index, event in enumerate(deliveries):
        if not event.wicket:
            continue

        dismissal = event.wicket.kind.replace("_", " ").replace("-", " ").title()

        detail = (
            f"{event.wicket.batter} was dismissed. "
            f"Dismissal type: {dismissal}. "
            f"Bowler: {event.bowler}."
        )

        if event.total_runs:
            detail += f" {event.total_runs} run(s) came on the delivery."

        stories.append(
            StoryItem(
                kind="wicket",
                title=f"{event.wicket.batter} dismissed",
                detail=detail,
                over_label=labels[index],
                ball_index=event.index,
            )
        )

    return stories


def detect_big_overs(deliveries: list[BallEvent]) -> list[StoryItem]:
    grouped = defaultdict(list)

    for event in deliveries:
        grouped[event.over].append(event)

    stories = []

    for over, events in sorted(grouped.items()):
        runs = sum(event.total_runs for event in events)

        if runs < BIG_OVER_RUNS:
            continue

        legal_balls = sum(event.is_legal for event in events)
        boundaries = sum(
            event.runs_off_bat in (4, 6) for event in events
        )
        wickets = sum(event.wicket is not None for event in events)

        detail = (
            f"{runs} runs scored from {legal_balls} legal deliveries, "
            f"including {boundaries} boundaries and {wickets} wicket(s)."
        )

        stories.append(
            StoryItem(
                kind="over",
                title=f"{runs}-run over",
                detail=detail,
                over_label=str(over + 1),
                ball_index=events[-1].index,
            )
        )

    return stories


def detect_momentum_shifts(
    deliveries: list[BallEvent],
) -> list[StoryItem]:
    """
    Compare two consecutive three-over periods.

    A change of at least 3 runs per over indicates
    a potentially meaningful scoring momentum shift.

    Consecutive overlapping windows with the same trend
    are not reported repeatedly.
    """
    grouped = defaultdict(list)

    for event in deliveries:
        grouped[event.over].append(event)

    overs = []

    for over, events in sorted(grouped.items()):
        overs.append({
            "over": over,
            "runs": sum(event.total_runs for event in events),
            "last_event": events[-1],
        })

    window = MOMENTUM_WINDOW_OVERS

    if len(overs) < window * 2:
        return []

    stories = []
    previous_direction = None

    for i in range(window * 2 - 1, len(overs)):
        previous = overs[i - (window * 2 - 1):i - window + 1]
        recent = overs[i - window + 1:i + 1]

        # Avoid comparing non-consecutive over ranges.
        combined = previous + recent

        if any(
            combined[j]["over"] + 1 != combined[j + 1]["over"]
            for j in range(len(combined) - 1)
        ):
            previous_direction = None
            continue

        previous_runs = sum(item["runs"] for item in previous)
        recent_runs = sum(item["runs"] for item in recent)

        change = (recent_runs - previous_runs) / window

        if change >= MOMENTUM_CHANGE_THRESHOLD:
            direction = "up"
        elif change <= -MOMENTUM_CHANGE_THRESHOLD:
            direction = "down"
        else:
            direction = None

        # Avoid generating repetitive overlapping stories.
        if direction is None:
            previous_direction = None
            continue

        if direction == previous_direction:
            continue

        last_event = recent[-1]["last_event"]

        if direction == "up":
            title = "Scoring momentum accelerated"
            detail = (
                f"The latest {window} overs produced {recent_runs} runs, "
                f"compared with {previous_runs} runs in the previous "
                f"{window} overs. Scoring increased by "
                f"{change:.1f} runs per over."
            )
        else:
            title = "Scoring momentum slowed"
            detail = (
                f"The latest {window} overs produced {recent_runs} runs, "
                f"compared with {previous_runs} runs in the previous "
                f"{window} overs. Scoring decreased by "
                f"{abs(change):.1f} runs per over."
            )

        stories.append(
            StoryItem(
                kind="momentum",
                title=title,
                detail=detail,
                over_label=str(recent[-1]["over"] + 1),
                ball_index=last_event.index,
            )
        )

        previous_direction = direction

    return stories


def detect_partnerships(
    deliveries: list[BallEvent],
    labels: list[str],
) -> list[StoryItem]:
    """
    Detect completed partnerships and the current ongoing partnership.

    A partnership ends when a wicket falls.
    """
    stories = []
    current_stand = []

    def build_story(segment, completed):
        if not segment:
            return None

        runs = sum(event.total_runs for event in segment)
        legal_balls = sum(event.is_legal for event in segment)

        if runs < PARTNERSHIP_MIN_RUNS:
            return None

        batter_counts = Counter()
        for event in segment:
            batter_counts[event.striker] += 1
            batter_counts[event.non_striker] += 1

        batters = [
            name for name, _ in batter_counts.most_common(2)
        ]

        if not batters:
            return None

        pair_text = " and ".join(batters)

        if completed:
            title = f"{runs}-run partnership"
            detail = (
                f"{pair_text} added {runs} runs from "
                f"{legal_balls} legal balls before a wicket fell."
            )
        else:
            title = f"Partnership reaches {runs} runs"
            detail = (
                f"{pair_text} have added {runs} runs from "
                f"{legal_balls} legal balls. "
                f"The partnership is still in progress."
            )

        last_event = segment[-1]
        last_position = last_event.index - 1

        return StoryItem(
            kind="partnership",
            title=title,
            detail=detail,
            over_label=labels[last_position],
            ball_index=last_event.index,
        )

    for event in deliveries:
        current_stand.append(event)

        if event.wicket:
            story = build_story(current_stand, completed=True)

            if story:
                stories.append(story)

            current_stand = []

    # Also consider the unfinished partnership at the end.
    story = build_story(current_stand, completed=False)

    if story:
        stories.append(story)

    return stories


def build_match_stories(data: ReplayData) -> list[StoryItem]:
    """
    Generate deterministic stories from actual match deliveries.
    """
    deliveries = data.deliveries

    if not deliveries:
        return []

    labels = _delivery_labels(deliveries)

    stories = []

    stories.extend(detect_wickets(deliveries, labels))
    stories.extend(detect_big_overs(deliveries))
    stories.extend(detect_momentum_shifts(deliveries))
    stories.extend(detect_partnerships(deliveries, labels))

    # Chronological ordering.
    stories.sort(key=lambda story: story.ball_index)

    return stories
