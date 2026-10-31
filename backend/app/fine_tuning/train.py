"""Train the intent classifier offline (for example in Colab), never at API startup."""
from pathlib import Path

LABELS = ["MATCH_STATISTICS", "MATCH_RECAP", "MOMENTUM_ANALYSIS", "PLAYER_COMPARISON", "CRICKET_RULES", "GENERAL_MATCH_QUERY"]


def train(output_dir: Path, dataset_path: Path) -> None:
    from datasets import load_dataset
    from peft import LoraConfig, TaskType, get_peft_model
    from transformers import AutoModelForSequenceClassification, AutoTokenizer, Trainer, TrainingArguments

    model_name = "google/bert_uncased_L-4_H-256_A-4"
    dataset = load_dataset("json", data_files=str(dataset_path))["train"].train_test_split(test_size=0.2, seed=42)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    label_ids = {label: index for index, label in enumerate(LABELS)}
    tokenized = dataset.map(
        lambda row: {**tokenizer(row["text"], truncation=True), "labels": [label_ids[value] for value in row["label"]]},
        batched=True,
    )
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=len(LABELS))
    model = get_peft_model(model, LoraConfig(task_type=TaskType.SEQ_CLS, r=8, lora_alpha=16, lora_dropout=0.1, target_modules=["query", "value"]))
    trainer = Trainer(model=model, args=TrainingArguments(output_dir=str(output_dir), num_train_epochs=2, report_to="none"), train_dataset=tokenized["train"], eval_dataset=tokenized["test"])
    trainer.train()
    trainer.save_model(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
