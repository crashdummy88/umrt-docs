#!/usr/bin/env python3
"""Adapt mothership Field Guide articles into docs Pages UI."""
from __future__ import annotations

import re
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDES = ROOT / "guides"
RAW_BASE = "https://raw.githubusercontent.com/crashdummy88/united-mobile-rv/main/guide"

SLUGS = [
    "12v-vs-120v-appliances-guide",
    "30-amp-vs-50-amp-guide",
    "awning-fabric-replacement-guide",
    "awning-motor-troubleshooting-guide",
    "backup-camera-tpms-install-guide",
    "battery-charging-voltage-chart",
    "best-inverters-guide",
    "best-leveling-systems-guide",
    "best-rv-tires-guide",
    "best-solar-panels-guide",
    "bms-explained-guide",
    "brake-controller-wiring-guide",
    "canbus-multiplex-systems-guide",
    "chassis-engine-maintenance-guide",
    "coleman-mach-ac-guide",
    "converter-inverter-charger-guide",
    "dinghy-towing-guide",
    "dometic-appliance-guide",
    "driving-the-up-winter-guide",
    "dump-station-guide",
    "electrical-troubleshooting",
    "fault-code-index-dometic-onan",
    "fifth-wheel-hitch-guide",
    "fresh-water-pump-guide",
    "gear-we-recommend",
    "generator-manufacturer-guide",
    "generator-troubleshooting",
    "gvwr-gcwr-payload-guide",
    "holding-tank-sanitation-guide",
    "inverter-sizing-guide",
    "lithium-agm-lead-acid-comparison",
    "lp-gas-pressure-specs",
    "lp-gas-troubleshooting",
    "mppt-vs-pwm-charge-controller-guide",
    "norcold-refrigerator-guide",
    "off-grid-power-budget-guide",
    "peplink-multi-wan-guide",
    "plumbing-troubleshooting",
    "ppi-guide",
    "propane-co-safety-guide",
    "roadside-kit-guide",
    "roof-coating-guide",
    "roof-material-comparison-guide",
    "roof-troubleshooting",
    "roof-vent-fan-install-guide",
    "rv-fire-safety-guide",
    "rv-furnace-troubleshooting-guide",
    "rv-microwave-troubleshooting-guide",
    "rv-storage-prep-guide",
    "seasonal-maintenance-checklist",
    "slide-out-leveling-troubleshooting-guide",
    "slide-out-seal-guide",
    "solar-battery-troubleshooting",
    "solar-sizing-installation-guide",
    "spring-dewinterization-checklist",
    "starlink-rv-guide",
    "surge-protector-ems-guide",
    "tank-sanitizing-guide",
    "tank-sensor-troubleshooting-guide",
    "tire-aging-guide",
    "tire-pressure-load-chart",
    "tires-brakes-tpms-guide",
    "toilet-systems-guide",
    "torque-spec-chart",
    "truma-combi-guide",
    "underbelly-insulation-guide",
    "van-build-electrical-troubleshooting",
    "victron-fault-code-guide",
    "water-filtration-guide",
    "water-heater-troubleshooting-guide",
    "weboost-install-guide",
    "weighing-your-rig-guide",
    "weight-distribution-hitch-guide",
    "window-seal-replacement-guide",
    "winterization-guide",
    "wire-ampacity-voltage-drop-chart",
]

CTX = ssl.create_default_context()


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "umrt-docs-port/1.0"})
    with urllib.request.urlopen(req, context=CTX, timeout=45) as resp:
        return resp.read().decode("utf-8", errors="replace")


def meta(src: str, name: str, default: str = "") -> str:
    m = re.search(rf'<meta name="{name}" content="([^"]*)"', src)
    if m:
        return m.group(1)
    m = re.search(rf'<meta property="{name}" content="([^"]*)"', src)
    if m:
        return m.group(1)
    m = re.search(r"<title>(.*?)</title>", src, re.S)
    return re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else default


def extract_main(src: str) -> str:
    m = re.search(r'<main id="main">(.*?)</main>', src, re.S)
    if not m:
        raise ValueError("no <main>")
    return m.group(1).strip()


def rewrite(html: str) -> str:
    html = html.replace("href=\"/guide/", "href=\"/guides/")
    html = re.sub(
        r'href="/book-service/"',
        'href="https://united-mobile-rv-llc.square.site/" target="_blank" rel="noopener"',
        html,
    )
    html = html.replace(">Book a Service</a>", ">Book</a>")
    html = html.replace(">Book Now</a>", ">Book</a>")
    html = html.replace(">All guides</a>", ">Field Guides</a>")
    for path in (
        "electrical",
        "victron",
        "wireless",
        "troubleshoot",
        "pricing",
        "service",
        "about",
        "faq",
        "service-areas",
        "privacy-policy",
        "terms-of-use",
    ):
        html = html.replace(f'href="/{path}/"', f'href="https://unitedmobilerv.com/{path}/"')
    html = html.replace(
        'href="/lithium-battery-buying-guide/"',
        'href="https://unitedmobilerv.com/lithium-battery-buying-guide/"',
    )
    html = html.replace("united-mobile-rv.pages.dev", "docs.unitedmobilerv.com")
    html = html.replace("class=\"btn btn-gold\"", "class=\"btn\"")
    return html


TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://docs.unitedmobilerv.com/guides/{slug}/">
<meta name="theme-color" content="#1A1A1A">
<link rel="icon" href="/assets/brand/favicon-64.png">
<link rel="stylesheet" href="/design/platform-bar.css">
<link rel="stylesheet" href="/design/convert-chrome.css">
<link rel="stylesheet" href="/design/docs-guide.css">
<script type="text/javascript" src="/design/clarity.js"></script>
</head>
<body>
<div class="umrt-platform-bar" role="navigation" aria-label="UMRT properties">
  <div class="umrt-platform-bar-inner">
    <a href="https://unitedmobilerv.com/" data-platform-link="hub">Home</a>
    <a href="https://unitedmobilerv.com/service/" data-platform-link="services">Services</a>
    <a href="https://shop.unitedmobilerv.com/" data-platform-link="shop">Shop</a>
    <a href="https://united-mobile-rv-llc.square.site/" data-platform-link="book" target="_blank" rel="noopener">Book</a>
    <a href="https://forum.unitedmobilerv.com/" data-platform-link="forum">Forum</a>
    <a href="https://software.unitedmobilerv.com/" data-platform-link="software">Software</a>
    <a href="https://docs.unitedmobilerv.com/" data-platform-link="docs" class="is-current" aria-current="page">Docs</a>
  </div>
</div>
<nav class="top" aria-label="Docs">
  <a href="/guides/">Guides</a>
  <a href="https://unitedmobilerv.com/guide/">WP library</a>
  <a href="/sop/">SOP</a>
  <a href="/account/">My Jobs</a>
</nav>
<p class="source wrap">Adapted from <a href="https://unitedmobilerv.com/guide/{slug}/">unitedmobilerv.com/guide/{slug}/</a>. Full library stays on the main-site hub.</p>
<article>
{article}
</article>
<p class="wrap"><a href="/guides/">← Field Guides</a></p>
<footer class="guide-foot wrap">
  <p>United Mobile RV LLC · <a href="tel:+16166065277">Call (616) 606-5277</a> · <a href="sms:+16166065277">Text Now</a></p>
  <p>
    <a href="https://unitedmobilerv.com/">Home</a> ·
    <a href="https://unitedmobilerv.com/service/">Services</a> ·
    <a href="https://shop.unitedmobilerv.com/">Shop</a> ·
    <a href="https://united-mobile-rv-llc.square.site/" target="_blank" rel="noopener">Book</a> ·
    <a href="https://forum.unitedmobilerv.com/">Forum</a> ·
    <a href="https://software.unitedmobilerv.com/">Software</a> ·
    <a href="https://docs.unitedmobilerv.com/">Docs</a>
  </p>
</footer>
<div class="umrt-mobile-bar" aria-label="Quick actions">
  <a href="tel:+16166065277">Call <span class="umrt-call-num">(616) 606-5277</span></a>
  <a href="sms:+16166065277">Text Now</a>
  <a href="https://united-mobile-rv-llc.square.site/" target="_blank" rel="noopener">Book</a>
  <a href="https://forum.unitedmobilerv.com/">Join the Free Forum</a>
</div>
<script src="/design/convert-chrome.js" defer></script>
</body>
</html>
"""


def port_one(slug: str) -> None:
    src = fetch(f"{RAW_BASE}/{slug}/index.html")
    title = meta(src, "og:title")
    if not title:
        tm = re.search(r"<title>(.*?)</title>", src, re.S)
        title = re.sub(r"<[^>]+>", "", tm.group(1)).strip() if tm else slug
    title = re.sub(r"\s*\|\s*UMRT.*$", "", title).strip()
    if "Docs" not in title:
        title = f"{title} · Docs"
    desc = meta(src, "description", "United Mobile RV field guide.")
    desc = desc.replace('"', "&quot;")
    article = rewrite(extract_main(src))
    out = GUIDES / slug / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        TEMPLATE.format(title=title, desc=desc, slug=slug, article=article),
        encoding="utf-8",
    )


def main() -> None:
    ok = 0
    failed = []
    for slug in SLUGS:
        try:
            port_one(slug)
            ok += 1
            print("ok", slug)
        except Exception as exc:
            failed.append((slug, str(exc)))
            print("FAIL", slug, exc)
    print(f"ported {ok}/{len(SLUGS)}")
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
