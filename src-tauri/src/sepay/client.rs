use serde::{Deserialize, Deserializer, Serialize};

fn deserialize_string_to_i64<'de, D>(deserializer: D) -> Result<i64, D::Error>
where
    D: Deserializer<'de>,
{
    let s: serde_json::Value = Deserialize::deserialize(deserializer)?;
    match s {
        serde_json::Value::String(s) => s.parse::<i64>().map_err(serde::de::Error::custom),
        serde_json::Value::Number(n) => n.as_i64().ok_or_else(|| serde::de::Error::custom("invalid i64")),
        _ => Err(serde::de::Error::custom("expected string or number")),
    }
}

fn deserialize_string_to_f64<'de, D>(deserializer: D) -> Result<Option<f64>, D::Error>
where
    D: Deserializer<'de>,
{
    let s: Option<serde_json::Value> = Deserialize::deserialize(deserializer)?;
    match s {
        None => Ok(None),
        Some(serde_json::Value::Null) => Ok(None),
        Some(serde_json::Value::String(s)) => s.parse::<f64>().map(Some).map_err(serde::de::Error::custom),
        Some(serde_json::Value::Number(n)) => Ok(n.as_f64()),
        _ => Err(serde::de::Error::custom("expected string or number")),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SePayTransaction {
    #[serde(deserialize_with = "deserialize_string_to_i64")]
    pub id: i64,
    pub transaction_date: String,
    #[serde(default, deserialize_with = "deserialize_string_to_f64")]
    pub amount_in: Option<f64>,
    #[serde(default, deserialize_with = "deserialize_string_to_f64")]
    pub amount_out: Option<f64>,
    #[serde(default, deserialize_with = "deserialize_string_to_f64")]
    pub accumulated: Option<f64>,
    pub transaction_content: Option<String>,
    pub account_number: Option<String>,
    pub sub_account: Option<String>,
    pub bank_brand_name: Option<String>,
    pub reference_number: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SePayResponse {
    pub status: i32,
    pub error: Option<String>,
    pub messages: Option<serde_json::Value>,
    pub transactions: Vec<SePayTransaction>,
}

pub struct SePayClient {
    client: reqwest::Client,
    base_url: String,
}

impl SePayClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            base_url: "https://my.sepay.vn/userapi".to_string(),
        }
    }

    pub async fn fetch_transactions(
        &self,
        token: &str,
        since_id: i64,
        limit: u32,
    ) -> Result<Vec<SePayTransaction>, String> {
        let url = format!("{}/transactions/list", self.base_url);
        let resp = self
            .client
            .get(&url)
            .header("Authorization", format!("Bearer {}", token))
            .query(&[
                ("limit", limit.to_string()),
                ("since_id", since_id.to_string()),
            ])
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("API error: HTTP {}", resp.status()));
        }

        let body_text = resp
            .text()
            .await
            .map_err(|e| format!("Read error: {}", e))?;

        let body: SePayResponse = serde_json::from_str(&body_text)
            .map_err(|e| format!("Parse error: {} | body: {}", e, &body_text[..body_text.len().min(200)]))?;

        if body.status != 200 {
            return Err(format!(
                "SePay error: {}",
                body.error.unwrap_or_else(|| "unknown".to_string())
            ));
        }

        Ok(body.transactions)
    }
}
