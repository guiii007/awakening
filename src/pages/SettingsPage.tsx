import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, Download, Trash2, Shield, AlertTriangle, Check, FileText, ChevronDown, ChevronUp, Moon, Sun, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { useThemeStore } from "@/lib/themeStore";
import { StorageService } from "@/lib/storage";
import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  const encrypted = useStore((s) => s.encrypted);
  const enableEncryption = useStore((s) => s.enableEncryption);
  const disableEncryption = useStore((s) => s.disableEncryption);
  const resetData = useStore((s) => s.resetData);

  const { theme, toggleTheme } = useThemeStore();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showEncryptionPanel, setShowEncryptionPanel] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleEnable() {
    setError("");
    if (pin.length < 4) return setError("PIN 至少 4 位");
    if (pin !== confirmPin) return setError("两次输入不一致");
    setBusy(true);
    try {
      await enableEncryption(pin);
      setPin("");
      setConfirmPin("");
      showToast("已开启加密保护");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    try {
      await disableEncryption();
      showToast("已关闭加密");
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    const json = await StorageService.exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `觉醒-数据备份-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("已导出 JSON 备份");
  }

  async function handleExportTxt() {
    const data = await StorageService.exportData();
    const parsed = JSON.parse(data);
    const lines: string[] = [];
    lines.push("=== 觉醒 · 数据备份 ===");
    lines.push(`导出时间：${new Date().toLocaleString("zh-CN")}`);
    lines.push("");

    lines.push("【觉察统计】");
    lines.push(`累计克制：${parsed.progress?.totalRestrain ?? 0} 次`);
    lines.push(`累计放纵：${parsed.progress?.totalRelapse ?? 0} 次`);
    lines.push(`日签开启：${parsed.progress?.dailyQuoteCount ?? 0} 次`);
    lines.push(`最长连续觉察：${parsed.progress?.bestStreak ?? 0} 天`);
    lines.push("");

    if (parsed.events?.length) {
      lines.push("【觉察记录】");
      parsed.events.forEach((e: any, i: number) => {
        const d = new Date(e.timestamp);
        const type = e.type === "restrain" ? "克制" : "放纵";
        lines.push(`${i + 1}. ${d.toLocaleString("zh-CN")} · ${type}`);
        if (e.scenario) lines.push(`   场景：${e.scenario}`);
        if (e.outcomeNote) lines.push(`   感受：${e.outcomeNote}`);
        lines.push("");
      });
    }

    if (parsed.tradeoffs?.length) {
      lines.push("【得失权衡笔记】");
      parsed.tradeoffs.forEach((t: any, i: number) => {
        const d = new Date(t.timestamp);
        lines.push(`${i + 1}. ${d.toLocaleDateString("zh-CN")}`);
        lines.push(`   长期目标：${t.longGoal}`);
        lines.push(`   必备条件：${t.requirements?.join("、") || ""}`);
        lines.push(`   舍弃享乐：${t.sacrifices?.join("、") || ""}`);
        lines.push("");
      });
    }

    if (parsed.dialogs?.length) {
      lines.push("【AI 对话记录】");
      parsed.dialogs.forEach((d: any, i: number) => {
        const date = new Date(d.timestamp);
        lines.push(`${i + 1}. ${date.toLocaleString("zh-CN")}`);
        d.messages?.forEach((m: any) => {
          const role = m.role === "ai" ? "AI" : "我";
          lines.push(`   ${role}：${m.content}`);
        });
        lines.push("");
      });
    }

    const txt = lines.join("\n");
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `觉醒-数据记录-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("已导出 TXT 记录");
  }

  async function handleReset() {
    await resetData();
    setShowResetConfirm(false);
    showToast("数据已清空");
  }

  return (
    <div>
      <PageHeader
        eyebrow="隐私设置"
        title="你的数据，只属于你"
        subtitle="所有记录都存储在本地浏览器，不会上传任何服务器。你可以加密、导出或彻底删除。"
      />

      <div className="space-y-5 max-w-2xl">
        {/* 隐私保护状态 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card p-6 bg-gradient-to-br from-sage-50/50 to-cream-50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-sage-100">
              <Shield className="w-5 h-5 text-sage-400" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <p className="font-serif text-lg font-bold text-ink-600">本地保护模式</p>
              <p className="text-xs text-ink-400 mt-0.5">
                {encrypted ? "已开启额外加密保护" : "数据仅存在你设备的浏览器中"}
              </p>
            </div>
            <span className={`chip text-xs ${encrypted ? "bg-sage-100 text-sage-500 dark:bg-night-200" : "bg-cream-200 text-ink-400 dark:bg-night-200"}`}>
              {encrypted ? "已加密" : "安全"}
            </span>
          </div>

          <div className="rounded-2xl bg-cream-50/60 p-4 mb-4">
            <p className="text-sm text-ink-500 leading-relaxed">
              · 所有数据只在你的设备上，不会上传任何服务器<br />
              · 没有账号、没有后台、没有远程存储<br />
              · 清除浏览器数据会同步删除本应用记录
            </p>
          </div>

          {!encrypted ? (
            <>
              <button
                onClick={() => setShowEncryptionPanel(!showEncryptionPanel)}
                className="w-full flex items-center justify-between text-sm text-dusk-400 hover:text-dusk-500 transition"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  需要更高隐私保护？设置 PIN 加密
                </span>
                {showEncryptionPanel
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />}
              </button>
              {showEncryptionPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden pt-4 border-t border-cream-200/60 mt-4"
                >
                  <p className="text-sm text-ink-500 mb-3">
                    设置 PIN 后，数据将以 AES-GCM 方式加密存储。
                    <span className="text-dawn-400">PIN 不可找回，请牢记。</span>
                  </p>
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="PIN 码（至少 4 位）"
                      className="input-soft"
                    />
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="再次输入 PIN"
                      className="input-soft"
                    />
                    {error && <p className="text-xs text-dawn-400">{error}</p>}
                    <button onClick={handleEnable} disabled={busy} className="btn-sage">
                      <Shield className="w-4 h-4" /> 开启加密保护
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="pt-4 border-t border-cream-200/60">
              <p className="text-sm text-ink-500 mb-3">已开启 AES-GCM 加密，数据以密文形式存储。</p>
              <button onClick={handleDisable} disabled={busy} className="btn-ghost">
                <Unlock className="w-4 h-4" /> 关闭加密
              </button>
            </div>
          )}
        </motion.div>

        {/* 数据导出 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-dawn-100 flex items-center justify-center">
              <Download className="w-5 h-5 text-dawn-400" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-ink-600">导出备份</p>
              <p className="text-xs text-ink-400 mt-0.5">把你的记录保存到本地</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExport} className="btn-ghost">
              <Download className="w-4 h-4" /> JSON 备份
            </button>
            <button onClick={handleExportTxt} className="btn-ghost">
              <FileText className="w-4 h-4" /> TXT 记录
            </button>
          </div>
          <p className="text-xs text-ink-400 mt-3">
            · JSON：完整数据，可用于备份恢复<br />
            · TXT：可读格式，手机可直接查看
          </p>
        </motion.div>

        {/* 外观设置 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-sage-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sage-400" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-ink-600">外观设置</p>
              <p className="text-xs text-ink-400 mt-0.5">调整你的视觉体验</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={toggleTheme} className="btn-ghost justify-start px-4">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === "dark" ? "浅色模式" : "深色模式"}</span>
            </button>
          </div>
          <p className="text-xs text-ink-400 mt-3">
            · 深色模式：保护夜间视力，减少蓝光
          </p>
        </motion.div>

        {/* 重置数据 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card p-6 border-dawn-200/40"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-dawn-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-dawn-400" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-ink-600">清空所有数据</p>
              <p className="text-xs text-ink-400 mt-0.5">不可恢复，请谨慎操作</p>
            </div>
          </div>
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)} className="btn-ghost text-dawn-400">
              <Trash2 className="w-4 h-4" /> 清空数据
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl bg-dawn-100/50 p-4 mb-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-dawn-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                <p className="text-sm text-ink-600">这将永久删除所有事件、权衡笔记、对话记录和进度。此操作不可撤销。</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)} className="btn-ghost">取消</button>
                <button onClick={handleReset} className="btn-primary bg-dawn-400 hover:bg-dawn-500">
                  <Trash2 className="w-4 h-4" /> 确认清空
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 关于隐私 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-sage-400" strokeWidth={1.8} />
            <p className="font-serif font-bold text-ink-600">关于你的隐私</p>
          </div>
          <div className="space-y-3 text-sm text-ink-500 leading-relaxed">
            <p>这款工具没有服务器，没有账号系统，也不会收集任何信息。</p>
            <p>你写下的每一个字、记录的每一次觉察，都只存在于你正在使用的这台设备里。</p>
            <p>如果你希望进一步保护，可以设置 PIN 加密，即使别人拿到你的设备也无法读取内容。</p>
            <p className="text-ink-400 text-xs pt-2 border-t border-cream-200/60">
              · 默认状态下数据存储在浏览器 IndexedDB 中<br />
              · 开启加密后使用 AES-GCM 加密存储<br />
              · 清除浏览器数据会永久删除所有记录
            </p>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 lg:bottom-8 left-1/2 z-50 bg-ink-600 text-cream-50 px-5 py-2.5 rounded-full text-sm shadow-soft flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-sage-300" /> {toast}
        </motion.div>
      )}
    </div>
  );
}
