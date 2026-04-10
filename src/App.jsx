import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveAs } from 'file-saver';
import { medicalSystems, medicalData, languages, comprehensionLevels, volumeOptions, diagramFormats, slideVolumeOptions } from './data/medicalData';

function App() {
  const [system, setSystem] = useState('ear');
  const [dept, setDept] = useState('e_otitis_media');
  const [disease, setDisease] = useState('custom');
  const [customDisease, setCustomDisease] = useState('');
  const [level, setLevel] = useState('senior');
  const [lang, setLang] = useState('ja');
  const [contentType, setContentType] = useState('document');
  const [volume, setVolume] = useState('a4_one');
  const [slideVolume, setSlideVolume] = useState('slide_10');
  const [diagramFormat, setDiagramFormat] = useState('infographic_v');
  const [hasSample, setHasSample] = useState(false);
  const [llmResult, setLlmResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // GAS 環境かどうかの判定
  const isGas = typeof google !== 'undefined' && google.script && google.script.run;

  useEffect(() => {
    // 系統が変わったら、その系統の最初の診療科をデフォルトに設定する
    const firstDeptForSystem = Object.keys(medicalData).find(key => medicalData[key].system === system);
    if (firstDeptForSystem) {
      setDept(firstDeptForSystem);
    }
  }, [system]);

  useEffect(() => {
    // 診療科が変わってもデフォルトで自由記載を選択状態にする
    setDisease('custom');
  }, [dept]);

  useEffect(() => {
    // GAS 環境の場合、管理者かどうかを確認する
    if (isGas) {
      google.script.run
        .withSuccessHandler((adminStatus) => {
          setIsAdmin(adminStatus);
        })
        .checkAdminStatus();
    }
  }, [isGas]);

  const generatedPrompt = React.useMemo(() => {
    const targetDisease = disease === 'custom' ? customDisease : disease;
    const deptLabel = medicalData[dept].label;
    const langLabel = languages.find(l => l.value === lang).label;
    const levelLabel = comprehensionLevels.find(cl => cl.value === level).label;
    const isDoctor = level === 'doctor';
    
    let promptText = "";
    const sampleText = hasSample ? '\n        - 「添付のファイルを参考に」構成要素を抽出してください。' : '';

    const constraintsGuideline = isDoctor ? `
    <constraints>
# 医師向け学術執筆ガイドライン：臨床的妥当性とエビデンスの構築

## 1. 基本理念
本ガイドラインは、臨床医が迅速かつ正確な意思決定を行うための「情報の高純度化」を目的とする。情緒的配慮や曖昧な平易化を排除し、統計的有意性、作用機序（MoA）、および臨床的実効性を軸とした、高精度なエビデンスの伝達を最優先事項とする。

---

## 2. 具体的な執筆基準

### A. 学術的厳密性と定義の明確化
* **作用機序の記述**: 「効く」という表現を避け、受容体結合、シグナル伝達系、薬理学的動態（PK/PD）に基づいた記述を行う。
* **医学的専門用語の保持**: 患者向けの言い換え（例：「痛みの軽減」）は、医学的指標（例：「VASスコアの有意な改善」や「QOL向上」）へと差し戻す。

### B. 定量的リスク・ベネフィット提示
* **統計量の必須付記**: 有効性の言及には、必ず $p$ 値、95%信頼区間（CI）、ハザード比（HR）、または $n$ 数（症例数）を併記する。
* **安全性の客観化**: 「安心」という主観を廃し、有害事象（AE）の発現率をCTCAE（Common Terminology Criteria for Adverse Events）等の基準に基づき定量的に提示する。

### C. 情報の効率的伝達
* **論理的階層化**: 結論（臨床的意義）を冒頭に配置し、背景、方法、結果、考察（IMRaD形式）の論理構造を厳守する。
* **主観の排除**: 筆者の所感ではなく、試験デザイン（RCT、メタ解析等）から導き出される客観的事実のみを記述する。

---

## 3. 推奨表現と避けるべき表現の対照表

| 項目 | 避けるべき表現（主観的・情緒的） | 推奨される表現（定量的・学術的） |
| --- | --- | --- |
| **有効性** | 画期的な、劇的に改善する、非常によく効く | 統計学的有意差（$p < 0.05$）を確認、主要評価項目を達成 |
| **安全性** | 副作用は少ない、100%安全、安心してください | Grade 3以上の有害事象発現率は $x$%、忍容性は良好 |
| **確実性** | 必ず治る、効果が期待される | 臨床的に有意な改善を示唆、～とのエビデンスが得られている |
| **臨床意義** | 痛みに寄り添う、辛さを和らげる | QOL（EQ-5D）の有意な向上、疼痛管理における有効性 |
| **比較** | 従来の薬より素晴らしい、一番良い | 既存標準治療（SOC）に対する非劣性/優越性を証明 |

---

## 4. 文体・フォーマットに関する指示

### トーン＆マナー（Academic & Precise）
* **三人称客観視点の徹底**: 「我々は～と考える」ではなく、「本試験の結果は～を示唆している」というエビデンス主導の記述。
* **断定のコントロール**: データに基づかない「断定」は禁止するが、有意差が認められた事実については「～が確認された」と明確に記述する。

### 禁止事項
* **誇大広告的修飾語**: 「革新的」「待望の」「驚くべき」等の形容詞。
* **曖昧な副詞**: 「かなり」「比較的」「概ね」など、解釈に個人差が出る表現。
* **感嘆符（！）および情緒的訴求**: プロフェッショナルな信頼性を損なうため一切禁止。

### 推奨される構造
1. **Executive Summary**: 臨床的結論の一行要約。
2. **Study Design**: エビデンスレベルの明示（ランダム化、盲検化の有無）。
3. **Key Results**: 統計量を用いた主要/副次評価項目の提示。
4. **Clinical Implication**: 臨床現場での適用可能性と制限事項の考察。
    </constraints>` : `
    <constraints>
### 医学的説明資料・執筆ガイドライン
- **冷静かつ客観的**：宣伝文句（キャッチコピー的な表現）は一切使用しない。
- **禁止事項**：
    - 「画期的」「革新的」「奇跡の」などの誇大表現
    - 「必ず治る」「100%安全」などの断定表現
    - 「安心してください」「心配いりません」などの過度な保証
    - 感嘆符（！）の使用
    - 「お辛いでしょうが」などの過度に感情的な寄り添い表現
- **推奨表現**：
    - 「効果が期待される」「改善の可能性がある」
    - 「現在の研究では〜とされています」
    - 「個人差があり、すべての方に当てはまるわけではありません」
    - 「メリットとリスクの両方をご理解いただいた上で」
- **予後の慎重さ**：100%の保証を感じさせる表現を避け、医学的な不確実性を適切に含める。
- **専門用語の平易化**：専門用語は使うが、その意味を「情緒的ではない平易な言葉」で補足する（例：「痛みに寄り添う」ではなく「痛みの軽減を目指す」）。
- **情報の透明性**：メリットを強調せず、デメリットや標準治療や代替案との比較において中立を保つ。
                
- 1文を短くし、句読点を適切に使い、読みやすくする。
- 重要な箇所は **太字** で強調する。
    </constraints>`;

    if (contentType === 'document') {
      const volumeLabel = volumeOptions.find(v => v.value === volume).label;
      promptText = `<prompt_architecture>
    <role>
        あなたは、地域医療に長年貢献し、患者様から「説明が非常にわかりやすい」と絶大な信頼を寄せられている熟練の耳鼻咽喉科専門医です。
        鼓膜や鼻腔の状態、喉の所見を視覚的にわかりやすく伝えつつ、医学的な正確さを保ちながら、安心感を与える丁寧な言葉遣いで説明を行うプロフェッショナルです。
        出力言語は「${langLabel}」とします。
    </role>

    <context>
        - 対象：${levelLabel}。
        - 疾患/術式：${targetDisease}。
        - 目的：${isDoctor ? 'エビデンスに基づき、臨床的妥当性を担保した専門的な情報共有・意思決定を行うこと。' : '病状や治療内容を正しく理解し、患者様やご家族が納得・安心して治療に臨めるようにすること。'}${sampleText}
    </context>

    <instructions>
        以下の構成を参考に、${volumeLabel}の分量で、読みやすいMarkdown形式の説明文書を作成してください。

        1. 【はじめに】：現在の状況に対する共感と、説明の趣旨。
        2. 【病名/状態と原因】：
            - 「${targetDisease}」とはどのような状態か。
            - なぜ治療や処置が必要なのか（放置した場合のリスク等）。
        3. 【治療・今後の流れについて】：
            - 具体的な治療法や、期待される効果。
            - 期間や、通院・入院の目安。
        4. 【生活上の注意点】：
            - 日常生活で気をつけるべきこと。
            - 「すぐに病院へ連絡すべきサイン」。
        5. 【結び】：前向きな励ましの言葉。

        制約事項：
        - ターゲット（${levelLabel}）に合わせた最適な言葉選びを行うこと。
        - 1文を短くし、句読点を適切に使い、読みやすくする。
        - 専門用語には必ず平易な説明を添える。
        - 文字が詰まりすぎないよう、Markdownの引用やリストを活用して視覚的な余裕を持たせる。
    </instructions>
${constraintsGuideline}

    <output_format>
        出力は、そのまま印刷または画面提示できる「Markdown形式」で行ってください。
        重要なポイントは **太字** にし、項目ごとに ### などの見出しで区切ってください。
        言語は必ず「${langLabel}」で出力してください。
    </output_format>
</prompt_architecture>`;
    } else if (contentType === 'slide') {
      // スライド構成案用ロジック
      const volumeLabel = slideVolumeOptions.find(v => v.value === slideVolume).label;
      const sampleText = hasSample ? '\n        - 「添付のファイルを参考に」構成要素を抽出してください。' : '';

      promptText = `<prompt_architecture>
    <role>
        あなたは地域医療に長年貢献し、患者様やそのご家族から「説明が非常にわかりやすい」と絶大な信頼を寄せられている熟練の${deptLabel}医であり、同時に優れたプレゼンテーションの構成者です。
    </role>

    <context>
        - 対象：${levelLabel}。
        - 疾患/術式：${targetDisease}。
        - 目的：口頭での説明に用いる「スライド構成案（プレゼンテーション用）」を作成すること。${isDoctor ? 'エビデンスに基づき、臨床的妥当性を担保した専門的な情報共有・意思決定を支援すること。' : '患者様が視覚的にも聴覚的にも理解しやすく、安心できる内容にすること。'}${sampleText}
    </context>

    <instructions>
        スライド構成案を「${volumeLabel}」で作成してください。以下のルールを厳守してください：

        【基本ルール】
        1. 1スライドにつき1メッセージ（ワンスライド・ワンメッセージ）を徹底すること。
        2. 各スライドには以下の3要素を必ず含めること：
           - **[タイトル＆メッセージ]**：そのスライドで最も伝えたい結論（15文字以内程度の大きな見出し）。
           - **[デザイン案・ビジュアル指示]**：スライドのどの位置に、どのようなイラスト・グラフ・アイコンを配置すべきかの具体的な指示。文字ばかりにならない工夫を凝らすこと。
           - **[スピーカーノート]**：医師が実際に口頭で話すための台本。専門用語を避け、「${levelLabel}」に合わせた優しい語り口調にすること。

        【構成のガイドライン（例：10枚の場合）】
        - 導入（共感、本日のゴール）
        - 疾患の概要（何が起きているか）
        - 原因と放置するリスク
        - 提案する治療法や処置の流れ
        - メリットとデメリット（合併症など）
        - 日常生活での注意点
        - 結び（一緒に頑張りましょうというメッセージ）
        ※ 枚数指定に応じて適切に統合・分割すること。
    </instructions>
${constraintsGuideline}

    <output_format>
        整理された構造のMarkdown形式で出力してください。
        出力言語（説明文やタイトルの内容）は必ず「${langLabel}」としてください。各スライドは「---」などで明確に区切ってください。
    </output_format>
</prompt_architecture>`;

    } else {
      // 図解・漫画用ロジック（nanobananaに特化）
      const formatLabel = diagramFormats.find(f => f.value === diagramFormat).label;
      
      const toolInstructions = `
        【nanobanana (図解特化AI) 向け指示】
        - 最終的に図解を生成するための元テキストを出力します。
        - 図解の構成要素として、「タイトル」「大見出し」「小見出し」「簡潔な本文（箇条書き）」の階層構造を明確にしてMarkdownで出力してください。
        - 文章量は極力削り、視覚的に配置したときに文字が多すぎないように最適化してください。`;

      promptText = `<prompt_architecture>
    <role>
        あなたは熟練の${deptLabel}医であり、同時に医療情報を視覚的にわかりやすく伝える「メディカル・インフォグラフィック・デザイナー」です。
        専門知識のない患者様でも一目で理解できるような構成を考えるプロフェッショナルです。
    </role>

    <context>
        - 対象：${levelLabel}。
        - 疾患/術式：${targetDisease}。
        - 目的：文字だけでは伝わりにくい医療情報を、図解や漫画で直感的に伝えるための構成案（プロンプト）を作成すること。${isDoctor ? 'エビデンスに基づき、臨床的妥当性を担保した専門的な情報共有を促進すること。' : ''}${sampleText}
    </context>

    <instructions>
        「${formatLabel}」として出力するためのプロンプト案やテキストを、以下の要件を満たして作成してください。

        ${toolInstructions}
        
        【含めるべき情報要素（必須）】
        - 「${targetDisease}」とは何か（一言で）
        - 主な症状と原因
        - 治療法や今後の見通し
        - 注意点（これだけは守ってほしいこと、すぐに受診すべきサイン）
    </instructions>
${constraintsGuideline}

    <output_format>
        整理された構造のMarkdown形式で出力してください。
        出力言語（説明文や構成の内容）は必ず「${langLabel}」としてください。
    </output_format>
</prompt_architecture>`;
    }

    return promptText;
  }, [dept, disease, customDisease, level, lang, contentType, volume, slideVolume, diagramFormat, hasSample]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('プロンプトをクリップボードにコピーしました！');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setApiError('');
    setLlmResult('');

    if (isGas) {
      // GAS 環境の場合
      google.script.run
        .withSuccessHandler((result) => {
          setLlmResult(result);
          setIsGenerating(false);
        })
        .withFailureHandler((err) => {
          setApiError(err.message);
          setIsGenerating(false);
        })
        .generateGeminiContent(generatedPrompt);
    } else {
      // ローカル/Vercel 環境の場合
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: generatedPrompt }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '生成に失敗しました');
        }

        const data = await response.json();
        setLlmResult(data.text);
      } catch (err) {
        console.error(err);
        setApiError(err.message);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const copyLlmResult = () => {
    navigator.clipboard.writeText(llmResult);
    alert('生成結果をクリップボードにコピーしました！');
  };

  const downloadLlmResult = () => {
    const blob = new Blob([llmResult], { type: 'text/markdown;charset=utf-8' });
    const targetDisease = disease === 'custom' ? customDisease : disease;
    saveAs(blob, `medical_explanation_${targetDisease}.md`);
  };

  const handleSaveToDocs = () => {
    if (!isGas) return;
    setIsSaving(true);
    const targetDisease = disease === 'custom' ? customDisease : disease;
    const title = `${targetDisease}に関する説明資料`;

    google.script.run
      .withSuccessHandler((result) => {
        setIsSaving(false);
        alert(`Google ドキュメントを作成しました！\nURL: ${result.url}`);
        window.open(result.url, '_blank');
      })
      .withFailureHandler((err) => {
        setIsSaving(false);
        alert(`エラー: ${err.message}`);
      })
      .saveToGoogleDocs(llmResult, title);
  };

  return (
    <div className="container">
      <h1>Medical Prompt Maker (耳鼻科版)</h1>
      <p className="subtitle">説明のための「最高」のプロンプトをデザインする</p>

      <div className="form-grid">
        <div className="form-group full-width step-group">
          <label className="step-label">STEP 1: 領域を選択</label>
          <div className="radio-group system-group">
            {medicalSystems.map(sys => (
              <label key={sys.value} className="radio-label system-label">
                <input
                  type="radio"
                  name="system"
                  value={sys.value}
                  checked={system === sys.value}
                  onChange={(e) => setSystem(e.target.value)}
                />
                <span>{sys.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group step-group">
          <label className="step-label">STEP 2: 疾患・グループを選択</label>
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            {Object.keys(medicalData)
              .filter(key => medicalData[key].system === system)
              .map(key => (
                <option key={key} value={key}>{medicalData[key].label}</option>
              ))
            }
          </select>
        </div>

        <div className="form-group">
          <label>説明対象（疾患・術式）</label>
          <select value={disease} onChange={(e) => setDisease(e.target.value)}>
            {medicalData[dept].diseases.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
            <option value="custom">-- 自由記載 --</option>
          </select>
          {disease === 'custom' && (
            <input
              type="text"
              placeholder="疾患名や術式を入力..."
              value={customDisease}
              onChange={(e) => setCustomDisease(e.target.value)}
              style={{ marginTop: '0.5rem' }}
            />
          )}
        </div>

        <div className="form-group">
          <label>理解度レベル</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {comprehensionLevels.map(cl => (
              <option key={cl.value} value={cl.value}>{cl.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>出力言語</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            {languages.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>形式</label>
          <div className="radio-group" style={{ marginBottom: '0.5rem' }}>
            <label className="radio-item">
              <input
                type="radio"
                name="contentType"
                value="document"
                checked={contentType === 'document'}
                onChange={() => setContentType('document')}
              /> 文書作成
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="contentType"
                value="diagram"
                checked={contentType === 'diagram'}
                onChange={() => setContentType('diagram')}
              /> 図解案
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="contentType"
                value="slide"
                checked={contentType === 'slide'}
                onChange={() => setContentType('slide')}
              /> スライド構成案
            </label>
          </div>
        </div>


        {contentType === 'document' ? (
          <div className="form-group">
            <label>分量</label>
            <select value={volume} onChange={(e) => setVolume(e.target.value)}>
              {volumeOptions.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
        ) : contentType === 'slide' ? (
          <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <label>スライド枚数</label>
            <select value={slideVolume} onChange={(e) => setSlideVolume(e.target.value)}>
              {slideVolumeOptions.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <label>図解・漫画の形式</label>
              <select value={diagramFormat} onChange={(e) => setDiagramFormat(e.target.value)}>
                {diagramFormats.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>


      <div className="form-group">
        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={hasSample}
            onChange={(e) => setHasSample(e.target.checked)}
          /> お手本ファイル（参考資料）がある
        </label>
      </div>

      {generatedPrompt && (
        <div className="result-area">
          <div className="result-header">
            <h3>生成されたプロンプト</h3>
            <button className="copy-btn" onClick={copyToClipboard}>コピー</button>
          </div>
          <div className="result-content prompt-box">
            {generatedPrompt}
          </div>
          
          {contentType === 'document' && (
            <div className="action-center">
              <button 
                className="generate-btn" 
                onClick={handleGenerate} 
                disabled={isGenerating}
              >
                {isGenerating ? '生成中...' : 'Gemini で実際に生成する'}
              </button>
            </div>
          )}
        </div>
      )}

      {apiError && (
        <div className="error-message">
          <p>⚠️ エラー: {apiError}</p>
        </div>
      )}

      {llmResult && (
        <div className="llm-result-area">
          <div className="result-header">
            <h3>Gemini の生成結果</h3>
            <div className="button-group">
              <button className="copy-btn secondary" onClick={copyLlmResult}>文面をコピー</button>
              <button className="copy-btn secondary" onClick={downloadLlmResult}>MDとして保存</button>
              {isAdmin && isGas && (
                <button 
                  className="copy-btn docs-btn" 
                  onClick={handleSaveToDocs}
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : 'Googleドキュメントに保存'}
                </button>
              )}
            </div>
          </div>
          <div className="llm-result-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {llmResult}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
