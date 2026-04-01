/** Google Tag Manager — single source of truth for layout + global-error. */
export const GTM_CONTAINER_ID = "GTM-NLSHKZ2F"

/**
 * Consent Mode defaults (runs before GTM). Without this, GA4/GTM may treat analytics as
 * denied and send no hits — Realtime stays at 0. If you add a CMP later, replace with
 * region-specific consent updates instead of broad defaults.
 */
export const GTM_CONSENT_DEFAULT_SCRIPT = `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
'analytics_storage':'granted',
'ad_storage':'granted',
'ad_user_data':'granted',
'ad_personalization':'granted',
'functionality_storage':'granted',
'personalization_storage':'granted',
'security_storage':'granted',
'wait_for_update':500
});`

/** Inline bootstrap (first script in <head>). */
export const GTM_HEAD_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];
w[l].push({'gtm.start':new Date().getTime(),
event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})
(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`

export const GTM_NS_IFRAME_SRC = `https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`
