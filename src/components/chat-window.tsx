import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import logoSrc from "@/assets/oshpaz-logo.png";
import { deriveTitle, type Thread } from "@/lib/threads-store";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const transport = new DefaultChatTransport({ api: "/api/chat" });

const SUGGESTIONS = [
  "Uyda kartoshka, piyoz va go'sht bor, nima tayyorlasam bo'ladi?",
  "Tezda tayyorlanadigan kechki ovqat tavsiya qil",
  "Klassik o'zbek palovi retseptini bosqichma-bosqich tushuntir",
  "Pishirayotgan taomim rasmini yuboraman — tahlil qil",
];

type Pending = { id: string; name: string; type: string; dataUrl: string };

type Props = {
  thread: Thread;
  onPersist: (thread: Thread) => void;
};

export function ChatWindow({ thread, onPersist }: Props) {
  const { messages, sendMessage, status } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport,
    onError: (err) => {
      console.error(err);
      toast.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    },
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [thread.id]);

  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      onPersist({
        ...thread,
        messages: messages as UIMessage[],
        title:
          thread.title === "Yangi suhbat"
            ? deriveTitle(messages as UIMessage[])
            : thread.title,
        updatedAt: Date.now(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, messages.length]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList).slice(0, 3);
    const next: Pending[] = [];
    for (const f of arr) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 8 * 1024 * 1024) {
        toast.error(`${f.name} 8MB dan katta`);
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(f);
      });
      next.push({
        id: Math.random().toString(36).slice(2),
        name: f.name,
        type: f.type,
        dataUrl,
      });
    }
    setPending((p) => [...p, ...next]);
  };

  const handleSubmit = async (msg: PromptInputMessage) => {
    const text = msg.text.trim();
    if ((!text && pending.length === 0) || isBusy) return;
    await sendMessage({
      text: text || "Ushbu rasmni tahlil qiling.",
      files: pending.map((p) => ({
        type: "file" as const,
        mediaType: p.type,
        url: p.dataUrl,
        filename: p.name,
      })),
    });
    setPending([]);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSuggestion = async (text: string) => {
    if (isBusy) return;
    await sendMessage({ text });
  };

  return (
    <div className="flex h-full flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex size-full flex-col items-center justify-center gap-4 p-8 text-center">
              <img
                src={logoSrc}
                alt="OSHPAZ AI"
                width={72}
                height={72}
                className="opacity-90"
              />
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  AI Oshpaz bilan suhbat
                </h2>
                <p className="text-sm text-muted-foreground">
                  Savol bering, retsept so'rang yoki taom rasmini yuboring.
                </p>
              </div>
              <div className="mt-2 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return message.role === "assistant" ? (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        ) : (
                          <span key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        );
                      }
                      if (
                        part.type === "file" &&
                        part.mediaType?.startsWith("image/")
                      ) {
                        return (
                          <img
                            key={i}
                            src={part.url}
                            alt={part.filename ?? "rasm"}
                            className="mt-2 max-h-64 rounded-lg border border-border"
                          />
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer>O'ylayapman...</Shimmer>
                  </MessageContent>
                </Message>
              )}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          {pending.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {pending.map((p) => (
                <div
                  key={p.id}
                  className="relative h-16 w-16 overflow-hidden rounded-lg border border-border"
                >
                  <img src={p.dataUrl} alt={p.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPending((arr) => arr.filter((x) => x.id !== p.id))}
                    className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="Savol yozing yoki taom rasmini yuboring..."
            />
            <PromptInputFooter className="justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Rasm
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <PromptInputSubmit status={status} disabled={isBusy} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            OSHPAZ AI xato qilishi mumkin. Muhim retseptlarni tekshiring.
          </p>
        </div>
      </div>
    </div>
  );
}
