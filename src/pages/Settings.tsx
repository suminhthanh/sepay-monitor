import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";
import { enable, disable } from "@tauri-apps/plugin-autostart";
import { useSettingsStore } from "@/stores/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getAvailableVoices } from "@/lib/tts";

export function Settings() {
  const { settings, setSetting } = useSettingsStore();
  const [tokenInput, setTokenInput] = useState(settings.apiToken);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTokenInput(settings.apiToken);
  }, [settings.apiToken]);

  useEffect(() => {
    function loadVoices() {
      const v = getAvailableVoices();
      if (v.length > 0) setVoices(v);
    }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  async function persistSetting(key: string, value: unknown) {
    const store = await load("settings.json", { defaults: {} });
    await store.set(key, value);
    await store.save();
  }

  async function handleSaveToken() {
    setSaving(true);
    try {
      await invoke("set_api_token", { token: tokenInput });
      setSetting("apiToken", tokenInput);
      await persistSetting("api_token", tokenInput);
      setTestResult(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await invoke<string>("test_connection", { token: tokenInput });
      setTestResult(`✓ ${result}`);
    } catch (e) {
      setTestResult(`✗ ${e}`);
    } finally {
      setTesting(false);
    }
  }

  async function handleVoiceChange(voiceName: string | null) {
    const voice = voiceName ?? "";
    setSetting("ttsVoice", voice);
    await persistSetting("tts_voice", voice);
  }

  async function handleToggle(
    key: keyof typeof settings,
    storeKey: string,
    value: boolean
  ) {
    setSetting(key, value as never);
    await persistSetting(storeKey, value);

    if (key === "autostartEnabled") {
      try {
        if (value) await enable();
        else await disable();
      } catch (e) {
        console.error("Autostart error:", e);
      }
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <h2 className="text-lg font-semibold">Cài đặt</h2>

      {/* API Token */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">SePay API Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="password"
            placeholder="Nhập API token..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveToken} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !tokenInput}
            >
              {testing ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
            </Button>
          </div>
          {testResult && (
            <p className={`text-sm ${testResult.startsWith("✓") ? "text-green-600" : "text-destructive"}`}>
              {testResult}
            </p>
          )}
        </CardContent>
      </Card>

      {/* TTS Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Thông báo giọng nói</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Bật thông báo giọng nói</span>
            <Switch
              checked={settings.announcementsEnabled}
              onCheckedChange={(v) => handleToggle("announcementsEnabled", "announcements_enabled", v)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Giọng đọc</label>
            <Select
              value={settings.ttsVoice}
              onValueChange={handleVoiceChange}
              disabled={!settings.announcementsEnabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giọng đọc..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Mặc định</SelectItem>
                {voices.map((v) => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification + Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Thông báo & Lọc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Thông báo desktop</span>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(v) => handleToggle("notificationsEnabled", "notifications_enabled", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Chỉ thông báo tiền vào</p>
              <p className="text-xs text-muted-foreground">Bỏ qua giao dịch tiền ra</p>
            </div>
            <Switch
              checked={settings.creditOnly}
              onCheckedChange={(v) => handleToggle("creditOnly", "credit_only", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Khởi động cùng máy tính</p>
              <p className="text-xs text-muted-foreground">Tự động chạy khi đăng nhập</p>
            </div>
            <Switch
              checked={settings.autostartEnabled}
              onCheckedChange={(v) => handleToggle("autostartEnabled", "autostart_enabled", v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
