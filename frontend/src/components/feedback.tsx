type FeedbackProps = {
  message: string | null;
  variant?: "info" | "error" | "success";
};

export function Feedback({ message, variant = "info" }: FeedbackProps) {
  if (!message) return null;

  const border =
    variant === "error"
      ? "border-[var(--red)]"
      : variant === "success"
        ? "border-[var(--green)]"
        : "border-[var(--border)]";

  const bg =
    variant === "error"
      ? "bg-[var(--red-lt)]"
      : variant === "success"
        ? "bg-[var(--green-lt)]"
        : "bg-[var(--bg2)]";

  const color =
    variant === "error"
      ? "text-[var(--red)]"
      : variant === "success"
        ? "text-[var(--green)]"
        : "text-[var(--text2)]";

  return (
    <div
      className={`mb-4 rounded-lg border px-3 py-2 text-[12px] leading-relaxed ${border} ${bg} ${color}`}
      role="status"
    >
      {message}
    </div>
  );
}
