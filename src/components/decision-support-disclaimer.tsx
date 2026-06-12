import { ShieldAlert } from "lucide-react";

export function DecisionSupportDisclaimer() {
  return (
    <section className="border-b border-amber-200 bg-amber-50/95">
      <div className="container-page flex gap-3 py-3 text-sm leading-6 text-amber-950">
        <ShieldAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden />
        <p>
          {
            "\u672c\u7cfb\u7d71\u4e0d\u57f7\u884c\u4e0b\u6ce8\uff0c\u4e0d\u9023\u63a5\u4efb\u4f55\u4e0b\u6ce8\u5e33\u865f\uff1b\u6240\u6709\u52dd\u7387\u90fd\u662f\u4f30\u8a08\u503c\uff0c\u6c92\u6709\u4efb\u4f55\u6a21\u578b\u80fd\u4fdd\u8b49\u7372\u5229\u3002\u55ae\u5834\u4e0b\u6ce8\u5efa\u8b70\u4e0d\u8d85\u904e\u672c\u91d1 2%\uff0c\u7981\u6b62\u68ad\u54c8\u3001\u51f9\u55ae\u8207\u99ac\u4e01\u52a0\u5009\uff1b\u81e8\u5834\u9663\u5bb9\u8207\u76e4\u53e3\u5287\u70c8\u8b8a\u52d5\u5f8c\u5fc5\u9808\u91cd\u65b0\u8a55\u4f30\u3002"
          }
        </p>
      </div>
    </section>
  );
}
