/**
 * ウェブアプリのメインエントリポイント
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Medical Prompt Maker - ENT')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 管理者（オーナー）かどうかを判定する
 */
function checkAdminStatus() {
  const effectiveUser = Session.getEffectiveUser().getEmail();
  const activeUser = Session.getActiveUser().getEmail();
  
  // 先生（オーナー）本人がアクセスしている場合
  // パターンA（自分の権限で実行）の場合、effectiveUser は常にオーナー
  // activeUser は認証済みユーザーがいれば取得可能
  return effectiveUser === activeUser || activeUser === ""; // activeUserが取れない場合はデフォルトで非表示にするか、運用に合わせて調整
}

/**
 * Gemini API を呼び出す
 */
function generateGeminiContent(prompt) {
  const properties = PropertiesService.getScriptProperties();
  const apiKey = properties.getProperty('GEMINI_API_KEY');
  const modelName = properties.getProperty('GEMINI_MODEL') || 'gemini-1.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY が設定されていません。スクリプトプロパティを確認してください。');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  if (response.getResponseCode() !== 200) {
    throw new Error(result.error?.message || 'Gemini API でエラーが発生しました。');
  }

  return result.candidates[0].content.parts[0].text;
}

/**
 * Google ドキュメントに保存する（管理者限定）
 */
function saveToGoogleDocs(text, title) {
  if (!checkAdminStatus()) {
    throw new Error('この操作は管理者のみ許可されています。');
  }

  const doc = DocumentApp.create(title || '医療説明書');
  doc.getBody().setText(text);
  
  return {
    url: doc.getUrl(),
    id: doc.getId()
  };
}
