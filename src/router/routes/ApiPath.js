const base_url = process.env.REACT_APP_BASE_URL

const api_url = {
  base_url,
  url: base_url.concat("/") + process.env.REACT_APP_OTHER_MODULES_URL,
  loginUrl: base_url.concat("/") + process.env.REACT_APP_LOGIN_URL,
  dlmsUrl: base_url.concat("/") + process.env.REACT_APP_MDAS_URL,
  colivingUrl: base_url.concat("/") + process.env.REACT_APP_COLIVING_URL,
  oldAssetsUrl: base_url.concat("/") + process.env.REACT_APP_OLD_ASSETS,
  colivingIssueUrl: base_url.concat("/") + process.env.REACT_APP_COLIVING_ISSUES,
  meterConfigUrl: base_url.concat("/") + process.env.REACT_APP_MDAS_URL,
  analyticsUrl: base_url.concat("/") + process.env.REACT_APP_ANALYTICS,
  healthPortalUrl: base_url.concat("/") + process.env.REACT_APP_HEALTH_PORTAL,
  consumerConfig: base_url.concat("/") + process.env.REACT_APP_CONSUMER_CONFIG,
  thinkGasHes: base_url.concat("/") + process.env.REACT_APP_THINK_GAS_HES,
  sourceStatusAPI: base_url.concat("/") + process.env.REACT_APP_SOURCE_STATUS_API,
  rentDeductionAPI: base_url.concat("/") + process.env.REACT_APP_RENT_DEDUCTION,
  satUrl: base_url.concat("/") + process.env.REACT_APP_SATTEST_URL,
  slaReports: base_url.concat("/") + process.env.REACT_APP_SLA_REPORTS,
  bulkCommandUrl: base_url.concat("/") + process.env.REACT_APP_BULK_COMMAND,
  uppclAPI: base_url.concat("/") + process.env.REACT_APP_UTILTIY_UPPCL_HES
}

export default api_url
