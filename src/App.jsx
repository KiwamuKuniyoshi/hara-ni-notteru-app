import React, { useMemo, useRef, useState } from "react";
import { Calculator, Share2, Download, Trophy, Scale, Ruler, Activity, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";

const APP_URL = "https://hara-ni-notteru-app.vercel.app";
const X_HANDLE = "@from100_keto";
const X_PROFILE_URL = "https://x.com/from100_keto";

const Button = ({ children, className = "", variant, ...props }) => (
  <button
    className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold border transition ${
      variant === "outline"
        ? "bg-white text-slate-900 border-slate-300"
        : "bg-slate-900 text-white border-slate-900"
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;

export default function HaraNiNotteruApp() {
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState("173");
  const [weight, setWeight] = useState("78.6");
  const [waist, setWaist] = useState("78");
  const resultRef = useRef(null);
  const exportRef = useRef(null);

  const genderLabel = gender === "male" ? "男性" : "女性";
  const metaboThreshold = gender === "male" ? 85 : 90;

  const metrics = useMemo(() => {
    const hCm = parseFloat(height);
    const wKg = parseFloat(weight);
    const waistCm = parseFloat(waist);

    if (!hCm || !wKg || !waistCm) return null;

    const hM = hCm / 100;
    const waistM = waistCm / 100;
    const bmi = wKg / (hM * hM);
    const spec = hCm - wKg;
    const whtr = waistCm / hCm;
    const absi = waistM / (Math.pow(bmi, 2 / 3) * Math.pow(hM, 1 / 2));
    const wwi = waistCm / Math.sqrt(wKg);
    const kgPerWaist = wKg / waistCm;
    const weightWaist = wKg * waistCm;
    const isMetaboWaist = waistCm >= metaboThreshold;

    return {
      hCm,
      wKg,
      waistCm,
      bmi,
      spec,
      whtr,
      absi,
      wwi,
      kgPerWaist,
      weightWaist,
      isMetaboWaist,
    };
  }, [height, weight, waist, metaboThreshold]);

  const bmiLabel = (bmi) => {
    if (bmi < 18.5) return { text: "低体重", tone: "text-sky-700" };
    if (bmi < 25) return { text: "普通体重", tone: "text-emerald-700" };
    if (bmi < 30) return { text: "肥満1度／過体重", tone: "text-red-600" };
    if (bmi < 35) return { text: "肥満2度", tone: "text-red-700" };
    return { text: "肥満3度以上", tone: "text-red-800" };
  };

  const specLabel = (spec) => {
    if (spec >= 115) return { text: "かなり軽い寄り／美容垢では細い扱いされやすい", tone: "text-sky-700" };
    if (spec >= 105) return { text: "軽め寄り／筋量・骨格は見ない", tone: "text-emerald-700" };
    if (spec >= 95) return { text: "標準〜重め寄り／筋量・骨格を無視", tone: "text-orange-600" };
    return { text: "重い寄り／筋量・骨格を無視", tone: "text-red-600" };
  };

  const waistLabel = (waistCm) => {
    const base = `${genderLabel}${metaboThreshold}cm基準`;
    if (waistCm >= metaboThreshold) {
      return { text: `メタボ腹囲基準以上（${base}）`, tone: "text-red-600" };
    }
    if (waistCm >= metaboThreshold - 5) {
      return { text: `基準未満だが近い（${base}）`, tone: "text-orange-600" };
    }
    return { text: `メタボ腹囲基準未満（${base}）`, tone: "text-emerald-700" };
  };

  const whtrLabel = (whtr) => {
    if (whtr < 0.45) return { text: "かなり良好", tone: "text-emerald-700" };
    if (whtr < 0.5) return { text: "良好", tone: "text-emerald-700" };
    if (whtr < 0.6) return { text: "腹囲注意", tone: "text-orange-600" };
    return { text: "腹囲リスク高め", tone: "text-red-700" };
  };

  const absiLabel = (absi) => {
    if (absi < 0.075) return { text: "低め／BMIのわりに腹囲小", tone: "text-emerald-700" };
    if (absi < 0.08) return { text: "標準〜境界／腹囲は小さくない", tone: "text-orange-600" };
    return { text: "高め注意／BMIのわりに腹囲大", tone: "text-red-700" };
  };

  const wwiLabel = (wwi) => {
    if (wwi < 9.5) return { text: "低め／腹薄い寄り", tone: "text-emerald-700" };
    if (wwi < 10.0) return { text: "標準／腹囲はおおむね普通", tone: "text-slate-700" };
    if (wwi < 10.4) return { text: "境界／体重のわりに腹囲やや大", tone: "text-orange-600" };
    return { text: "高め注意／体重のわりに腹囲大", tone: "text-red-700" };
  };

  const kgPerWaistLabel = (kgPerWaist) => {
    if (kgPerWaist >= 1.0) return { text: "高め＝腹が細いまま重い", tone: "text-blue-700" };
    if (kgPerWaist >= 0.92) return { text: "標準〜高め／腹以外にも体重あり", tone: "text-slate-700" };
    return { text: "低め＝腹囲に対して体重は軽め", tone: "text-orange-600" };
  };

  const bodyType = (m) => {
    if (!m) return "";

    const bmiHigh = m.bmi >= 25;
    const bmiNormalOrLow = m.bmi < 25;
    const whtrHigh = m.whtr >= 0.5;
    const whtrGood = m.whtr < 0.5;
    const metabo = m.isMetaboWaist;
    const bellyWarning = whtrHigh || metabo;
    const bellyGood = whtrGood && !metabo;
    const muscularLike = m.kgPerWaist >= 0.98 && m.wwi < 10.0;

    if (bmiHigh && bellyGood && muscularLike) return "腹には乗ってない重量級";
    if (bmiHigh && bellyGood) return "BMIだけ肥満型";
    if (bmiHigh && bellyWarning) return "王道減量対象";
    if (bmiNormalOrLow && bellyWarning) return "隠れ腹乗り型";
    if (m.bmi < 18.5 && bellyWarning) return "痩せ型腹乗り注意";
    if (m.kgPerWaist >= 1.0 && bellyGood) return "ガンゴリ型";
    return "標準スリム型";
  };

  const conclusion = (m) => {
    if (!m) return null;
    const bmi = bmiLabel(m.bmi).text;
    const whtr = whtrLabel(m.whtr).text;
    const waist = waistLabel(m.waistCm).text;
    const metaboPhrase = m.isMetaboWaist
      ? `${genderLabel}のメタボ腹囲基準以上`
      : `${genderLabel}のメタボ腹囲基準未満`;

    if (m.bmi >= 25 && m.whtr < 0.5 && !m.isMetaboWaist && m.wwi < 10.0) {
      return {
        line1: `BMI と スペックだけ見ると「重い・${bmi}」。`,
        line2: `でもWHtRは「${whtr}」、腹囲も「${waist}」。`,
        line3: "＝ 体重はあるが、腹には乗っていない。",
        tone1: "text-red-600",
        tone2: "text-emerald-700",
        tone3: "text-blue-800",
      };
    }

    if (m.bmi >= 25 && (m.whtr >= 0.5 || m.isMetaboWaist)) {
      return {
        line1: `BMIでは「${bmi}」。`,
        line2: `WHtRは「${whtr}」、かつ${metaboPhrase}。`,
        line3: "＝ 体重にも腹囲にも乗っている可能性。",
        tone1: "text-red-600",
        tone2: "text-red-600",
        tone3: "text-red-700",
      };
    }

    if (m.bmi < 25 && (m.whtr >= 0.5 || m.isMetaboWaist)) {
      return {
        line1: `BMIだけ見ると「${bmi}」。`,
        line2: `でもWHtRは「${whtr}」、かつ${metaboPhrase}。`,
        line3: "＝ BMIでは見逃す“隠れ腹乗り型”。",
        tone1: "text-emerald-700",
        tone2: "text-orange-600",
        tone3: "text-orange-600",
      };
    }

    if (m.bmi < 18.5 && (m.whtr >= 0.5 || m.isMetaboWaist)) {
      return {
        line1: "BMIだけ見ると低体重。",
        line2: `でもWHtRは「${whtr}」、腹囲も「${waist}」。`,
        line3: "＝ 痩せていても腹囲は別で見るべき。",
        tone1: "text-sky-700",
        tone2: "text-orange-600",
        tone3: "text-orange-600",
      };
    }

    return {
      line1: `BMIは「${bmi}」。`,
      line2: `WHtRは「${whtr}」、腹囲も「${waist}」。`,
      line3: "＝ 体重と腹囲のバランスはおおむね良好。",
      tone1: "text-slate-900",
      tone2: "text-emerald-700",
      tone3: "text-blue-800",
    };
  };

  const rows = metrics
    ? [
        {
          icon: <Scale className="w-7 h-7" />,
          name: "スペック",
          origin: "SNS・美容垢で俗に使われる指標",
          formula: "身長(cm) − 体重(kg)",
          value: metrics.spec.toFixed(1),
          judge: specLabel(metrics.spec).text,
          tone: specLabel(metrics.spec).tone,
        },
        {
          icon: <Activity className="w-7 h-7" />,
          name: "BMI",
          origin: "ケトレー指数／普及：Ancel Keys ら",
          formula: "体重(kg) ÷ 身長(m)²",
          value: metrics.bmi.toFixed(2),
          judge: `${bmiLabel(metrics.bmi).text}／筋肉量を見ない`,
          tone: bmiLabel(metrics.bmi).tone,
        },
        {
          icon: <Ruler className="w-7 h-7" />,
          name: "ウエスト",
          origin: "腹囲そのもの／メタボ腹囲チェック",
          formula: "ウエスト(cm)",
          value: `${metrics.waistCm.toFixed(0)}cm`,
          judge: waistLabel(metrics.waistCm).text,
          tone: waistLabel(metrics.waistCm).tone,
        },
        {
          icon: <Ruler className="w-7 h-7" />,
          name: "WHtR",
          origin: "Waist-to-Height Ratio",
          formula: "ウエスト(cm) ÷ 身長(cm)",
          value: metrics.whtr.toFixed(3),
          judge: whtrLabel(metrics.whtr).text,
          tone: whtrLabel(metrics.whtr).tone,
        },
        {
          icon: <Activity className="w-7 h-7" />,
          name: "ABSI",
          origin: "Krakauer & Krakauer（2012）",
          formula: "ウエスト(m) ÷ [BMI^(2/3) × 身長(m)^(1/2)]",
          value: metrics.absi.toFixed(4),
          judge: absiLabel(metrics.absi).text,
          tone: absiLabel(metrics.absi).tone,
        },
        {
          icon: <Activity className="w-7 h-7" />,
          name: "WWI",
          origin: "Park ら（2018）",
          formula: "ウエスト(cm) ÷ √体重(kg)",
          value: metrics.wwi.toFixed(2),
          judge: wwiLabel(metrics.wwi).text,
          tone: wwiLabel(metrics.wwi).tone,
        },
        {
          icon: <Dumbbell className="w-7 h-7" />,
          name: "体重÷ウエスト",
          origin: "俺",
          formula: "体重(kg) ÷ ウエスト(cm)",
          value: metrics.kgPerWaist.toFixed(3),
          judge: kgPerWaistLabel(metrics.kgPerWaist).text,
          tone: kgPerWaistLabel(metrics.kgPerWaist).tone,
        },
        {
          icon: <Scale className="w-7 h-7" />,
          name: "体重×ウエスト",
          origin: "ヤーマン氏",
          formula: "体重(kg) × ウエスト(cm)",
          value: metrics.weightWaist.toFixed(1),
          judge: "同体重帯比較用／腹囲込みの重さ感",
          tone: "text-blue-700",
        },
      ]
    : [];

  const xText = metrics
    ? `${genderLabel} / ${metrics.hCm.toFixed(0)}cm / ${metrics.wKg.toFixed(1)}kg / W${metrics.waistCm.toFixed(0)}cm\n\nBMI：${metrics.bmi.toFixed(1)}\nWHtR：${metrics.whtr.toFixed(3)}\nABSI：${metrics.absi.toFixed(4)}\nWWI：${metrics.wwi.toFixed(2)}\n体重÷ウエスト：${metrics.kgPerWaist.toFixed(3)}\n腹囲：${waistLabel(metrics.waistCm).text}\n\nタイプ：${bodyType(metrics)}\n\n診断はこちら：${APP_URL}\n作った人：${X_HANDLE}\n\n#BMIだけではわからない\n#腹に乗ってる`
    : "";

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(xText);
      alert("X投稿文をコピーしたぞ");
    } catch (e) {
      alert("コピーに失敗。手動でコピーしてくれ");
    }
  };

  const downloadImage = async () => {
    if (!exportRef.current || !metrics) {
      alert("保存する結果がまだないぞ");
      return;
    }

    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      const genderText = gender === "male" ? "male" : "female";
      link.download = `hara-ni-notteru_${genderText}_${metrics.hCm.toFixed(0)}cm_${metrics.wKg.toFixed(1)}kg_W${metrics.waistCm.toFixed(0)}cm.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
      alert("画像保存に失敗した。もう一回試してくれ");
    }
  };

  const exportToneColor = (tone) => {
    if (tone.includes("red")) return "#dc2626";
    if (tone.includes("orange")) return "#ea580c";
    if (tone.includes("emerald")) return "#047857";
    if (tone.includes("blue")) return "#1d4ed8";
    if (tone.includes("sky")) return "#0369a1";
    return "#334155";
  };

  const ExportImage = () => {
    if (!metrics) return null;
    const c = conclusion(metrics);

    return (
      <div
        ref={exportRef}
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: "1080px",
          height: "1350px",
          background: "#f8fafc",
          padding: "34px",
          zIndex: -1,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: "#020617",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#ffffff",
            border: "2px solid #e2e8f0",
            borderRadius: "36px",
            overflow: "hidden",
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.10)",
          }}
        >
          <div style={{ padding: "34px 44px 22px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                borderRadius: "9999px",
                background: "#0f172a",
                color: "#ffffff",
                padding: "10px 22px",
                fontSize: "18px",
                fontWeight: 900,
                marginBottom: "16px",
              }}
            >
              腹に乗ってる？
            </div>

            <div style={{ fontSize: "42px", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
              BMI・スペックだけでは体型はわからない
            </div>

            <div style={{ marginTop: "12px", fontSize: "28px", fontWeight: 900, color: "#172554", lineHeight: 1.3 }}>
              {genderLabel} / {metrics.hCm.toFixed(0)}cm / {metrics.wKg.toFixed(1)}kg / W{metrics.waistCm.toFixed(0)}cm
            </div>
          </div>

          <div
            style={{
              margin: "0 44px 24px",
              border: "4px solid #f59e0b",
              borderRadius: "28px",
              background: "#fffbeb",
              padding: "24px 28px",
            }}
          >
            <div style={{ color: "#b45309", fontWeight: 900, fontSize: "30px", marginBottom: "8px" }}>結論</div>
            <div style={{ fontWeight: 900, fontSize: "25px", lineHeight: 1.55 }}>
              <div style={{ color: exportToneColor(c.tone1) }}>{c.line1}</div>
              <div style={{ color: exportToneColor(c.tone2) }}>{c.line2}</div>
              <div style={{ color: exportToneColor(c.tone3) }}>{c.line3}</div>
              <div style={{ marginTop: "6px", color: "#0f172a" }}>
                タイプ：<span style={{ textDecoration: "underline", textDecorationColor: "#f59e0b", textDecorationThickness: "4px" }}>{bodyType(metrics)}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              padding: "0 44px",
            }}
          >
            {rows.map((row) => (
              <div
                key={`export-card-${row.name}`}
                style={{
                  border: "2px solid #e2e8f0",
                  borderRadius: "22px",
                  background: "#ffffff",
                  padding: "18px 20px",
                  minHeight: "126px",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ fontSize: "25px", fontWeight: 900, color: "#172554", lineHeight: 1.2 }}>{row.name}</div>
                  <div style={{ fontSize: "34px", fontWeight: 900, lineHeight: 1, whiteSpace: "nowrap" }}>{row.value}</div>
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    color: exportToneColor(row.tone),
                    fontWeight: 900,
                    fontSize: "19px",
                    lineHeight: 1.32,
                  }}
                >
                  {row.judge}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    color: "#475569",
                    fontWeight: 800,
                    fontSize: "17px",
                    lineHeight: 1.25,
                  }}
                >
                  式：{row.formula}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              left: "72px",
              right: "72px",
              bottom: "50px",
              color: "#64748b",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: 1.5,
            }}
          >
            ※ 腹囲は日本のメタボリックシンドローム腹囲基準（男性85cm以上・女性90cm以上）を参考にした簡易チェックです。正式なメタボ診断には血圧・血糖・脂質などの確認が必要です。ABSI・WWIの判定は簡易目安です。
            <br />
            作った人：{X_HANDLE}｜診断はこちら：{APP_URL}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 p-4 sm:p-8">
      <style>{`
        .mobile-result-cards { display: none; }
        .desktop-result-table { display: block; }
        .app-shell { width: 100%; }
        @media (max-width: 720px) {
          .app-shell { padding: 12px !important; }
          .top-title { font-size: 28px !important; line-height: 1.15 !important; }
          .top-subtitle { font-size: 16px !important; }
          .top-note { font-size: 12px !important; }
          .input-grid-mobile { display: grid !important; grid-template-columns: 1fr !important; gap: 14px !important; }
          .gender-buttons { display: grid !important; grid-template-columns: 1fr 1fr !important; }
          .result-title { font-size: 22px !important; line-height: 1.25 !important; }
          .result-subtitle { font-size: 15px !important; line-height: 1.5 !important; }
          .premise-chip { font-size: 12px !important; line-height: 1.5 !important; }
          .desktop-result-table { display: none !important; }
          .mobile-result-cards { display: grid !important; gap: 12px; padding: 16px; }
          .metric-card { border: 1px solid #e2e8f0; border-radius: 18px; background: #fff; padding: 14px; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04); }
          .metric-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
          .metric-card-name { display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 16px; color: #172554; }
          .metric-card-value { font-weight: 900; font-size: 22px; color: #020617; white-space: nowrap; }
          .metric-card-line { display: grid; grid-template-columns: 76px 1fr; gap: 8px; font-size: 12px; line-height: 1.5; margin-top: 6px; }
          .metric-card-label { color: #64748b; font-weight: 700; }
          .metric-card-text { color: #334155; font-weight: 700; }
          .conclusion-box { margin: 16px !important; padding: 16px !important; border-width: 3px !important; }
          .conclusion-inner { gap: 10px !important; }
          .conclusion-title { font-size: 22px !important; }
          .conclusion-text { font-size: 16px !important; line-height: 1.7 !important; }
          .footer-note { font-size: 11px !important; line-height: 1.6 !important; padding: 0 16px 20px !important; }
        }
      `}</style>

      <ExportImage />

      <main className="max-w-6xl mx-auto space-y-6 app-shell">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 py-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-bold shadow-sm">
            <Calculator className="w-4 h-4" />
            腹に乗ってる？
          </div>
          <div>
            <a
              href={X_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"
            >
              作った人：{X_HANDLE}
            </a>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight top-title">スペックとBMIはクソ</h1>
          <p className="text-lg sm:text-2xl font-bold text-slate-700 top-subtitle">ウエスト加味する体型診断</p>
          <p className="text-sm sm:text-base text-slate-500 top-note">
            身長・体重・ウエストから「腹に乗ってる体重」かを見るミニ診断。
          </p>
        </motion.section>

        <Card className="rounded-3xl shadow-lg border-slate-200">
          <CardContent className="p-5 sm:p-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 input-grid-mobile">
              <label className="space-y-2">
                <span className="font-bold">性別</span>
                <div className="flex gap-3 gender-buttons">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`w-full rounded-2xl border px-4 py-3 font-black ${
                      gender === "male" ? "bg-blue-950 text-white border-slate-900" : "bg-white text-slate-900 border-slate-300"
                    }`}
                  >
                    男性
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`w-full rounded-2xl border px-4 py-3 font-black ${
                      gender === "female" ? "bg-blue-950 text-white border-slate-900" : "bg-white text-slate-900 border-slate-300"
                    }`}
                  >
                    女性
                  </button>
                </div>
              </label>
              <label className="space-y-2">
                <span className="font-bold">身長 cm</span>
                <input
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xl font-bold"
                />
              </label>
              <label className="space-y-2">
                <span className="font-bold">体重 kg</span>
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xl font-bold"
                />
              </label>
              <label className="space-y-2 sm:col-span-3">
                <span className="font-bold">ウエスト cm</span>
                <input
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xl font-bold"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {metrics && (
          <section ref={resultRef} className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-5 sm:p-8 text-center border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
              <h2 className="text-2xl sm:text-4xl font-black result-title">BMI・スペックだけでは体型はわからない</h2>
              <p className="mt-2 text-lg sm:text-2xl font-black text-blue-950 result-subtitle">
                {genderLabel} / {metrics.hCm.toFixed(0)}cm / {metrics.wKg.toFixed(1)}kg / ウエスト
                {metrics.waistCm.toFixed(0)}cm の各指標比較
              </p>
              <div className="mt-4 inline-block rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 premise-chip">
                前提：{genderLabel}｜身長 {metrics.hCm.toFixed(0)}cm｜体重 {metrics.wKg.toFixed(1)}kg｜ウエスト {metrics.waistCm.toFixed(0)}cm
              </div>
            </div>

            <div className="overflow-x-auto desktop-result-table">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="bg-blue-950 text-white">
                    <th className="p-4 text-left">指標</th>
                    <th className="p-4 text-left">提唱者・由来</th>
                    <th className="p-4 text-left">計算式</th>
                    <th className="p-4 text-center">あなたの数値</th>
                    <th className="p-4 text-left">判定・読み方</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.name} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border-t border-slate-200 p-4">
                        <div className="flex items-center gap-3 font-black text-xl">
                          <span className="text-blue-900">{row.icon}</span>
                          {row.name}
                        </div>
                      </td>
                      <td className="border-t border-slate-200 p-4 font-medium text-slate-700">{row.origin}</td>
                      <td className="border-t border-slate-200 p-4 font-bold">{row.formula}</td>
                      <td className="border-t border-slate-200 p-4 text-center text-3xl font-black">{row.value}</td>
                      <td className={`border-t border-slate-200 p-4 font-black ${row.tone}`}>{row.judge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-result-cards">
              {rows.map((row) => (
                <div key={row.name} className="metric-card">
                  <div className="metric-card-head">
                    <div className="metric-card-name">
                      <span>{row.icon}</span>
                      {row.name}
                    </div>
                    <div className="metric-card-value">{row.value}</div>
                  </div>
                  <div className="metric-card-line">
                    <div className="metric-card-label">判定</div>
                    <div className={`metric-card-text ${row.tone}`}>{row.judge}</div>
                  </div>
                  <div className="metric-card-line">
                    <div className="metric-card-label">計算式</div>
                    <div className="metric-card-text">{row.formula}</div>
                  </div>
                  <div className="metric-card-line">
                    <div className="metric-card-label">由来</div>
                    <div className="metric-card-text">{row.origin}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="m-5 sm:m-8 rounded-3xl border-4 border-amber-500 bg-amber-50 p-5 sm:p-7 conclusion-box">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 conclusion-inner">
                <div className="flex items-center gap-3 text-amber-700 font-black text-3xl conclusion-title">
                  <Trophy className="w-10 h-10" />
                  結論
                </div>
                <div className="text-lg sm:text-2xl font-black leading-relaxed conclusion-text">
                  <p className={conclusion(metrics).tone1}>{conclusion(metrics).line1}</p>
                  <p className={conclusion(metrics).tone2}>{conclusion(metrics).line2}</p>
                  <p className={conclusion(metrics).tone3}>{conclusion(metrics).line3}</p>
                  <p className="mt-2 text-slate-900">
                    タイプ：<span className="underline decoration-amber-500 decoration-4">{bodyType(metrics)}</span>
                  </p>
                </div>
              </div>
            </div>

            <p className="px-4 pb-6 text-xs sm:text-sm text-slate-500 footer-note">
              ※ 腹囲は日本のメタボリックシンドローム腹囲基準（男性85cm以上・女性90cm以上）を参考にした簡易チェックです。正式なメタボ診断には血圧・血糖・脂質などの確認が必要です。ABSI・WWIの判定は簡易目安です。
              <br />
              作った人：
              <a href={X_PROFILE_URL} target="_blank" rel="noreferrer" className="font-black text-blue-700">
                {X_HANDLE}
              </a>
            </p>
          </section>
        )}

        <Card className="rounded-3xl shadow-md border-slate-200">
          <CardContent className="p-5 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={copyText} className="rounded-2xl text-base font-bold h-12">
                <Share2 className="w-5 h-5 mr-2" />
                X投稿文をコピー
              </Button>
              <Button variant="outline" className="rounded-2xl text-base font-bold h-12" onClick={downloadImage}>
                <Download className="w-5 h-5 mr-2" />
                X用画像を保存
              </Button>
            </div>
            <textarea
              readOnly
              value={xText}
              className="w-full min-h-44 rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm font-medium leading-relaxed"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
