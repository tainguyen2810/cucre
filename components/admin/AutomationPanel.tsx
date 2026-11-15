"use client";

import { previewTelegram, runImportNow, sendTelegramNow, type AutoState } from "@/app/admin/(panel)/tu-dong/actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";

function Result({ state }: { state: AutoState }) {
  if (!state.summary) return null;
  return <p role="status" className={`rounded-md px-3 py-2 text-sm ${state.ok ? "bg-ok-bg text-ok" : "bg-warn-bg text-warn"}`}>{state.summary}</p>;
}

export function ImportPanel({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState<AutoState>(runImportNow, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <Button type="submit" variant="dark" disabled={pending || !enabled} className="self-start">{pending ? "Đang nhập…" : "Nhập mã ngay"}</Button>
      <Result state={state} />
    </form>
  );
}

export function TelegramPanel({ enabled }: { enabled: boolean }) {
  const [preview, previewAction, previewing] = useActionState<AutoState>(previewTelegram, {});
  const [sent, sendAction, sending] = useActionState<AutoState>(sendTelegramNow, {});
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <form action={previewAction}><Button type="submit" variant="light" disabled={previewing}>{previewing ? "Đang tạo…" : "Xem trước tin hôm nay"}</Button></form>
        {preview.message ? (
          <form action={sendAction}><Button type="submit" disabled={sending || !enabled}>{sending ? "Đang gửi…" : "Gửi lên kênh"}</Button></form>
        ) : null}
      </div>
      {preview.message ? (
        <pre className="max-h-96 overflow-auto rounded-lg bg-canvas p-3 text-[13px] leading-relaxed whitespace-pre-wrap">{preview.message.replace(/<[^>]+>/g, "")}</pre>
      ) : (
        <Result state={preview} />
      )}
      <Result state={sent} />
    </div>
  );
}
