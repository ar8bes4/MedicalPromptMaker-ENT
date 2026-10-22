const CONFIG = {
  GEMINI_MODEL: 'gemini-3.1-flash-lite'
};

/**
 * ウェブアプリのメインエントリポイント
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Medical Prompt Maker - ENT')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 管理者（オーナー）かどうかを判定する
 */
function checkAdminStatus() {
  const effectiveUser = Session.getEffectiveUser().getEmail();
  const activeUser = Session.getActiveUser().getEmail();
  
  // 先生（オーナー）本人がアクセスしている場合のみ許可（Fail-Closed）
  // 未認証・外部アクセス時は activeUser が空文字となるため false を返す
  return Boolean(effectiveUser && activeUser && effectiveUser === activeUser);
}

/**
 * Gemini API を呼び出す
 */
function generateGeminiContent(prompt) {
  // UIの表示制御に依存せず、API利用前にサーバーで認可する。
  if (!checkAdminStatus()) {
    throw new Error('この操作は管理者のみ許可されています。');
  }
  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('有効なプロンプトが指定されていません。');
  }
  if (prompt.length > 20000) {
    throw new Error('プロンプトの文字数が上限（20,000文字）を超えています。');
  }
  const properties = PropertiesService.getScriptProperties();
  const apiKey = properties.getProperty('GEMINI_API_KEY');
  const modelName = CONFIG.GEMINI_MODEL;

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
