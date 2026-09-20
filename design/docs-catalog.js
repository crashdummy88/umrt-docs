/* Searchable guides + troubleshooting catalog. Client-side filter only. */
(function () {
  /* Architect GO — live tech pin prompts only. Do not invent slugs
     or point pins at the generic forum home. */
  var FORUM_PINS = {
    winterize: { label: 'Winterize', href: 'https://forum.unitedmobilerv.com/forum/t/tech-winterize' },
    '12v': { label: '12V', href: 'https://forum.unitedmobilerv.com/forum/t/tech-12v-battery' },
    solar: { label: 'Solar', href: 'https://forum.unitedmobilerv.com/forum/t/tech-solar' },
    slides: { label: 'Slides', href: 'https://forum.unitedmobilerv.com/forum/t/tech-slides' },
    generator: { label: 'Generator', href: 'https://forum.unitedmobilerv.com/forum/t/tech-generator' }
  };

  var CATEGORIES = [
    { id: "all", label: "All" },
    { id: "electrical", label: "Electrical" },
    { id: "power", label: "Power" },
    { id: "solar", label: "Solar" },
    { id: "wireless", label: "Wireless" },
    { id: "plumbing", label: "Plumbing" },
    { id: "lp-gas", label: "LP gas" },
    { id: "appliances", label: "Appliances" },
    { id: "roof", label: "Roof & slides" },
    { id: "chassis", label: "Chassis & towing" },
    { id: "generators", label: "Generators" },
    { id: "seasonal", label: "Seasonal" },
    { id: "reference", label: "Reference" },
    { id: "policies", label: "Policies" }
  ];

  var ENTRIES = [
    {
      id: "12v-vs-120v-appliances-guide",
      title: "12V vs. 120V RV Appliances Explained",
      blurb: "Every RV runs both systems side by side. Knowing which is which changes what you can actually run off-grid.",
      kind: "Guide",
      category: "electrical",
      href: "/guides/12v-vs-120v-appliances-guide/",
      source: "https://unitedmobilerv.com/guide/12v-vs-120v-appliances-guide/",
      tags: "12v vs 120v appliances guide"
    },
    {
      id: "30-amp-vs-50-amp-guide",
      title: "30-amp vs 50-amp shore power explained",
      blurb: "50-amp service isn’t “more current on one wire” — it’s a fundamentally different hookup. Here’s what that means for what you can actually run.",
      kind: "Guide",
      category: "electrical",
      href: "/guides/30-amp-vs-50-amp-guide/",
      source: "https://unitedmobilerv.com/guide/30-amp-vs-50-amp-guide/",
      tags: "30 amp vs 50 amp guide"
    },
    {
      id: "awning-fabric-replacement-guide",
      title: "RV Awning Fabric Replacement Guide",
      blurb: "Wind is the number one cause of awning damage, and it’s largely preventable.",
      kind: "Guide",
      category: "roof",
      href: "/guides/awning-fabric-replacement-guide/",
      source: "https://unitedmobilerv.com/guide/awning-fabric-replacement-guide/",
      tags: "awning fabric replacement guide"
    },
    {
      id: "awning-motor-troubleshooting-guide",
      title: "Awning Motor & Wind Sensor Troubleshooting",
      blurb: "Powered awnings add convenience and a few new failure points. Here’s how to isolate them.",
      kind: "Troubleshooting",
      category: "roof",
      href: "/guides/awning-motor-troubleshooting-guide/",
      source: "https://unitedmobilerv.com/guide/awning-motor-troubleshooting-guide/",
      tags: "awning motor troubleshooting guide"
    },
    {
      id: "backup-camera-tpms-install-guide",
      title: "Backup Camera & TPMS Install Guide",
      blurb: "RV OWNER’S FIELD GUIDE · CONNECTIVITY & SAFETY Backup cameras and tire pressure monitoring systems get bundled into a lot of install jobs because they solve two of the biggest…",
      kind: "Guide",
      category: "wireless",
      href: "/guides/backup-camera-tpms-install-guide/",
      source: "https://unitedmobilerv.com/guide/backup-camera-tpms-install-guide/",
      tags: "backup camera tpms install guide"
    },
    {
      id: "battery-charging-voltage-chart",
      title: "Battery charging voltage chart by chemistry",
      blurb: "REFERENCE 25-00 · BATTERIES & ENERGY STORAGE Reference charging voltages for 12V nominal lead-acid (flooded/AGM) and LiFePO4 battery banks.",
      kind: "Reference",
      category: "power",
      href: "/guides/battery-charging-voltage-chart/",
      source: "https://unitedmobilerv.com/guide/battery-charging-voltage-chart/",
      tags: "battery charging voltage chart"
    },
    {
      id: "best-inverters-guide",
      title: "Best RV Inverter/Chargers — Buying Guide",
      blurb: "An inverter converts your battery bank’s DC power to the AC power your appliances need — and the type, size, and features matter more than the brand name on the box.",
      kind: "Guide",
      category: "power",
      href: "/guides/best-inverters-guide/",
      source: "https://unitedmobilerv.com/guide/best-inverters-guide/",
      tags: "best inverters guide"
    },
    {
      id: "best-leveling-systems-guide",
      title: "Best leveling systems — buying guide",
      blurb: "Leveling is not only about sleep. An unlevel rig changes how an absorption fridge cools, how slides seat and seal, and where water sits on the roof. Choose complexity you are…",
      kind: "Guide",
      category: "chassis",
      href: "/guides/best-leveling-systems-guide/",
      source: "https://unitedmobilerv.com/guide/best-leveling-systems-guide/",
      tags: "best leveling systems guide"
    },
    {
      id: "best-rv-tires-guide",
      title: "Best RV Tires — Buying Guide",
      blurb: "Tire choice on an RV or trailer isn’t just about brand — it’s about matching the tire’s category, load range, and speed rating to how the vehicle is actually built and used.",
      kind: "Guide",
      category: "chassis",
      href: "/guides/best-rv-tires-guide/",
      source: "https://unitedmobilerv.com/guide/best-rv-tires-guide/",
      tags: "best rv tires guide"
    },
    {
      id: "best-solar-panels-guide",
      title: "Best RV Solar Panels — Buying Guide",
      blurb: "The “best” solar panel depends entirely on your roof space, mounting preference, and how the rig actually gets used — rigid, flexible, and portable panels each solve a…",
      kind: "Guide",
      category: "solar",
      href: "/guides/best-solar-panels-guide/",
      source: "https://unitedmobilerv.com/guide/best-solar-panels-guide/",
      tags: "best solar panels guide"
    },
    {
      id: "bms-explained-guide",
      title: "BMS explained — what your lithium pack is protecting",
      blurb: "A BMS is not optional decoration. It opens for a reason: voltage, current, temperature, or cell imbalance. Resetting without diagnosis invites a repeat trip.",
      kind: "Guide",
      category: "power",
      href: "/guides/bms-explained-guide/",
      source: "https://unitedmobilerv.com/guide/bms-explained-guide/",
      tags: "bms explained guide"
    },
    {
      id: "brake-controller-wiring-guide",
      title: "Brake controller wiring that actually stops the trailer",
      blurb: "A brake controller only works if power, ground, and the blue brake output are clean. Intermittent trailer brakes are often a connection problem, not a “bad module.”",
      kind: "Guide",
      category: "chassis",
      href: "/guides/brake-controller-wiring-guide/",
      source: "https://unitedmobilerv.com/guide/brake-controller-wiring-guide/",
      tags: "brake controller wiring guide"
    },
    {
      id: "canbus-multiplex-systems-guide",
      title: "RV CAN-Bus & Multiplex Control System Guide (Lippert OneControl, Firefly, Spyder)",
      blurb: "Newer RVs increasingly run lighting, slides, awnings, and leveling through a single digital network instead of dozens of dedicated switches and relays.",
      kind: "Guide",
      category: "electrical",
      href: "/guides/canbus-multiplex-systems-guide/",
      source: "https://unitedmobilerv.com/guide/canbus-multiplex-systems-guide/",
      tags: "canbus multiplex systems guide"
    },
    {
      id: "chassis-engine-maintenance-guide",
      title: "Motorhome chassis & engine maintenance",
      blurb: "Class A/C gas chassis and diesel pushers accumulate calendar time faster than highway miles. Follow the VIN’s OEM schedule, catch known patterns early, and measure on-site — do…",
      kind: "Guide",
      category: "chassis",
      href: "/guides/chassis-engine-maintenance-guide/",
      source: "https://unitedmobilerv.com/guide/chassis-engine-maintenance-guide/",
      tags: "chassis engine maintenance guide"
    },
    {
      id: "coleman-mach-ac-guide",
      title: "Coleman Mach AC Troubleshooting Guide",
      blurb: "The other major rooftop AC brand alongside Dometic — different control board, different common faults.",
      kind: "Guide",
      category: "appliances",
      href: "/guides/coleman-mach-ac-guide/",
      source: "https://unitedmobilerv.com/guide/coleman-mach-ac-guide/",
      tags: "coleman mach ac guide"
    },
    {
      id: "converter-inverter-charger-guide",
      title: "Converter, inverter, and charger roles",
      blurb: "Non-Victron 12V converter and inverter-charger brands — charge stages, common hardware failures, and fault codes for the three most common systems in stock RVs.",
      kind: "Guide",
      category: "power",
      href: "/guides/converter-inverter-charger-guide/",
      source: "https://unitedmobilerv.com/guide/converter-inverter-charger-guide/",
      tags: "converter inverter charger guide"
    },
    {
      id: "dinghy-towing-guide",
      title: "Dinghy / toad towing setup",
      blurb: "Flat-towing a car behind a motorhome needs three things working together: a vehicle the maker says can flat-tow, a proper base plate and tow bar, and supplemental braking. Skip…",
      kind: "Guide",
      category: "chassis",
      href: "/guides/dinghy-towing-guide/",
      source: "https://unitedmobilerv.com/guide/dinghy-towing-guide/",
      tags: "dinghy towing guide"
    },
    {
      id: "dometic-appliance-guide",
      title: "Dometic AC, Fridge & Awning Troubleshooting Guide",
      blurb: "Dometic runs more RV rooftop AC units, fridges, and awnings on the road than any other brand. Here’s the real fault reference for the three systems that generate the most…",
      kind: "Guide",
      category: "appliances",
      href: "/guides/dometic-appliance-guide/",
      source: "https://unitedmobilerv.com/guide/dometic-appliance-guide/",
      tags: "dometic appliance guide"
    },
    {
      id: "driving-the-up-winter-guide",
      title: "Driving Michigan’s U.P. & Winter Roads Guide",
      blurb: "RV OWNER’S FIELD GUIDE · SEASONAL, TRAVEL & MICHIGAN-SPECIFIC The Upper Peninsula is one of the most scenic legs of our route — it’s also one of the most remote, with…",
      kind: "Guide",
      category: "seasonal",
      href: "/guides/driving-the-up-winter-guide/",
      source: "https://unitedmobilerv.com/guide/driving-the-up-winter-guide/",
      tags: "driving the up winter guide"
    },
    {
      id: "dump-station-guide",
      title: "RV dump station how-to",
      blurb: "A quick field reference for new owners — order and etiquette matter more than gear branding. Legal dump only; leave the pad cleaner than you found it.",
      kind: "Guide",
      category: "plumbing",
      href: "/guides/dump-station-guide/",
      source: "https://unitedmobilerv.com/guide/dump-station-guide/",
      tags: "dump station guide"
    },
    {
      id: "electrical-troubleshooting",
      title: "RV electrical & shore-power troubleshooting",
      blurb: "Frame shore-power, 12V drain, and converter symptoms before you start swapping parts — then know when metered mobile diagnostics beat DIY.",
      kind: "Troubleshooting",
      category: "electrical",
      href: "/guides/electrical-troubleshooting/",
      source: "https://unitedmobilerv.com/guide/electrical-troubleshooting/",
      tags: "electrical troubleshooting"
    },
    {
      id: "fault-code-index-dometic-onan",
      title: "OEM Fault Code Index — Onan Generators & Dometic Refrigerators",
      blurb: "REFERENCE 45-00 · DIAGNOSTICS & FAULT CODES The first two brand indexes in an ongoing fault-code reference — more brands (Norcold, Lippert, Suburban/Atwood, Progressive…",
      kind: "Reference",
      category: "reference",
      href: "/guides/fault-code-index-dometic-onan/",
      source: "https://unitedmobilerv.com/guide/fault-code-index-dometic-onan/",
      tags: "fault code index dometic onan"
    },
    {
      id: "fifth-wheel-hitch-guide",
      title: "Fifth-wheel hitch install & service",
      blurb: "Fifth-wheel hitches put pin weight over the truck bed — into the frame when installed correctly. Fixed vs sliding, jaw care, and hardware checks matter more than a bumper-pull…",
      kind: "Guide",
      category: "chassis",
      href: "/guides/fifth-wheel-hitch-guide/",
      source: "https://unitedmobilerv.com/guide/fifth-wheel-hitch-guide/",
      tags: "fifth wheel hitch guide"
    },
    {
      id: "fresh-water-pump-guide",
      title: "RV fresh water pump",
      blurb: "The demand pump is one of the most-replaced parts on an RV — and one of the most often replaced unnecessarily. Find the leak, air path, or strainer issue before you buy another…",
      kind: "Guide",
      category: "plumbing",
      href: "/guides/fresh-water-pump-guide/",
      source: "https://unitedmobilerv.com/guide/fresh-water-pump-guide/",
      tags: "fresh water pump guide"
    },
    {
      id: "gear-we-recommend",
      title: "Gear We Recommend",
      blurb: "Stuff worth buying and installing yourself -- picked for reliability and value, not just whatever ranks first. Where a job needs certified hands (sealed refrigerant, gas lines,…",
      kind: "Guide",
      category: "seasonal",
      href: "/guides/gear-we-recommend/",
      source: "https://unitedmobilerv.com/guide/gear-we-recommend/",
      tags: "gear we recommend"
    },
    {
      id: "generator-manufacturer-guide",
      title: "Onan, Cummins & Honda Generator Troubleshooting & Service Guide",
      blurb: "Manufacturer-specific fault codes, no-start diagnostics, and service intervals for the generators most RVers actually own — built-in Cummins Onan gensets and portable Honda…",
      kind: "Guide",
      category: "generators",
      href: "/guides/generator-manufacturer-guide/",
      source: "https://unitedmobilerv.com/guide/generator-manufacturer-guide/",
      tags: "generator manufacturer guide"
    },
    {
      id: "generator-troubleshooting",
      title: "RV generator troubleshooting",
      blurb: "A generator that won’t start, won’t stay running, or won’t produce power is one of the most common calls we get — and one of the most preventable. Here’s how to think through it.",
      kind: "Troubleshooting",
      category: "generators",
      href: "/guides/generator-troubleshooting/",
      source: "https://unitedmobilerv.com/guide/generator-troubleshooting/",
      tags: "generator troubleshooting"
    },
    {
      id: "gvwr-gcwr-payload-guide",
      title: "GVWR, GCWR, and payload without the fog",
      blurb: "Ratings exist to keep axles, tires, and frames inside their design. Mixing up GVWR with cargo capacity is how rigs leave the lot already overweight.",
      kind: "Guide",
      category: "chassis",
      href: "/guides/gvwr-gcwr-payload-guide/",
      source: "https://unitedmobilerv.com/guide/gvwr-gcwr-payload-guide/",
      tags: "gvwr gcwr payload guide"
    },
    {
      id: "holding-tank-sanitation-guide",
      title: "RV holding tank sanitation",
      blurb: "Bad sensor readings, odor, and sticky solids make up most sanitation calls. Almost all of it comes down to water volume, treatment honesty, and never dumping illegal.",
      kind: "Guide",
      category: "plumbing",
      href: "/guides/holding-tank-sanitation-guide/",
      source: "https://unitedmobilerv.com/guide/holding-tank-sanitation-guide/",
      tags: "holding tank sanitation guide"
    },
    {
      id: "inverter-sizing-guide",
      title: "Size your RV inverter correctly",
      blurb: "An undersized inverter trips constantly. An oversized one wastes standby power every hour of every day. Size it to what you actually run.",
      kind: "Guide",
      category: "power",
      href: "/guides/inverter-sizing-guide/",
      source: "https://unitedmobilerv.com/guide/inverter-sizing-guide/",
      tags: "inverter sizing guide"
    },
    {
      id: "lithium-agm-lead-acid-comparison",
      title: "Lithium vs AGM vs lead-acid for RVs",
      blurb: "The sticker price isn’t the real comparison. Cost per usable cycle is. A lead-acid or AGM bank you can only draw down to 50% without shortening its life; lithium you can draw…",
      kind: "Guide",
      category: "power",
      href: "/guides/lithium-agm-lead-acid-comparison/",
      source: "https://unitedmobilerv.com/guide/lithium-agm-lead-acid-comparison/",
      tags: "lithium agm lead acid comparison"
    },
    {
      id: "lp-gas-pressure-specs",
      title: "RV LP Gas Pressure Specs & Timed Leak Test (NFPA 1192)",
      blurb: "Reference values from NFPA 1192 (Standard on Recreational Vehicles) practice for regulator output pressure and the timed pressure-drop test.",
      kind: "Reference",
      category: "lp-gas",
      href: "/guides/lp-gas-pressure-specs/",
      source: "https://unitedmobilerv.com/guide/lp-gas-pressure-specs/",
      tags: "lp gas pressure specs"
    },
    {
      id: "lp-gas-troubleshooting",
      title: "LP gas system troubleshooting",
      blurb: "LP gas problems are safety-sensitive by nature. Here’s how to tell a routine fix from something that needs a professional immediately — plus the regulator, tank, and detector…",
      kind: "Troubleshooting",
      category: "lp-gas",
      href: "/guides/lp-gas-troubleshooting/",
      source: "https://unitedmobilerv.com/guide/lp-gas-troubleshooting/",
      tags: "lp gas troubleshooting"
    },
    {
      id: "mppt-vs-pwm-charge-controller-guide",
      title: "MPPT vs. PWM Solar Charge Controllers",
      blurb: "Both keep your panels from overcharging the battery. Only one of them actually gets full value out of your panels. Here’s the difference, in numbers.",
      kind: "Guide",
      category: "solar",
      href: "/guides/mppt-vs-pwm-charge-controller-guide/",
      source: "https://unitedmobilerv.com/guide/mppt-vs-pwm-charge-controller-guide/",
      tags: "mppt vs pwm charge controller guide"
    },
    {
      id: "norcold-refrigerator-guide",
      title: "Norcold Refrigerator Troubleshooting Guide",
      blurb: "Norcold’s absorption fridges fail differently than Dometic’s — different codes, different common causes. Here’s what to check before calling it a lost cause.",
      kind: "Guide",
      category: "appliances",
      href: "/guides/norcold-refrigerator-guide/",
      source: "https://unitedmobilerv.com/guide/norcold-refrigerator-guide/",
      tags: "norcold refrigerator guide"
    },
    {
      id: "off-grid-power-budget-guide",
      title: "Off-grid RV power budget that holds",
      blurb: "Solar, battery, and inverter sizing all come from the same starting point: what you actually run, and for how long. Work it out here first. For each device: watts × hours used…",
      kind: "Guide",
      category: "power",
      href: "/guides/off-grid-power-budget-guide/",
      source: "https://unitedmobilerv.com/guide/off-grid-power-budget-guide/",
      tags: "off grid power budget guide"
    },
    {
      id: "peplink-multi-wan-guide",
      title: "Peplink multi-WAN for RVs — bonding and/or failover that survives travel",
      blurb: "Serious travelers rarely trust a single WAN. Cellular is fast and low-latency near towers; Starlink keeps you online where towers disappear; campground Wi-Fi can be a useful…",
      kind: "Guide",
      category: "wireless",
      href: "/guides/peplink-multi-wan-guide/",
      source: "https://unitedmobilerv.com/guide/peplink-multi-wan-guide/",
      tags: "peplink multi wan guide"
    },
    {
      id: "plumbing-troubleshooting",
      title: "RV plumbing & water-system troubleshooting",
      blurb: "Low pressure, a pump that won’t stop running, no hot water, or a sulfur smell — most RV plumbing complaints trace back to one of a handful of causes. Here’s how to narrow it down.",
      kind: "Troubleshooting",
      category: "plumbing",
      href: "/guides/plumbing-troubleshooting/",
      source: "https://unitedmobilerv.com/guide/plumbing-troubleshooting/",
      tags: "plumbing troubleshooting"
    },
    {
      id: "ppi-guide",
      title: "Pre-purchase RV inspection (PPI) guide",
      blurb: "Independent PPI before you buy — moisture meter, electrical load tests, roof/seals, and the costly finds a dealer walkthrough misses.",
      kind: "Guide",
      category: "seasonal",
      href: "/guides/ppi-guide/",
      source: "https://unitedmobilerv.com/guide/ppi-guide/",
      tags: "ppi guide"
    },
    {
      id: "propane-co-safety-guide",
      title: "Propane and CO safety that keeps the coach livable",
      blurb: "LP gas and carbon monoxide faults are not “sort it out tomorrow” projects. Detectors, ventilation, and leak response come before convenience.",
      kind: "Guide",
      category: "lp-gas",
      href: "/guides/propane-co-safety-guide/",
      source: "https://unitedmobilerv.com/guide/propane-co-safety-guide/",
      tags: "propane co safety guide"
    },
    {
      id: "roadside-kit-guide",
      title: "RV emergency roadside kit",
      blurb: "Most kits are built around what is convenient to sell. Build yours around what you actually reach for on a shoulder — visibility first, then the tools that get you to a shop…",
      kind: "Guide",
      category: "lp-gas",
      href: "/guides/roadside-kit-guide/",
      source: "https://unitedmobilerv.com/guide/roadside-kit-guide/",
      tags: "roadside kit guide"
    },
    {
      id: "roof-coating-guide",
      title: "RV Roof Coating & Resealing Guide",
      blurb: "Two different jobs that get confused constantly — resealing seams and penetrations, and coating the whole roof. Here’s the difference.",
      kind: "Guide",
      category: "roof",
      href: "/guides/roof-coating-guide/",
      source: "https://unitedmobilerv.com/guide/roof-coating-guide/",
      tags: "roof coating guide"
    },
    {
      id: "roof-material-comparison-guide",
      title: "RV roof materials — care differs by skin",
      blurb: "Most RV roof failures start at penetrations and lap seals, not because someone picked the “wrong” membrane brand on a forum.",
      kind: "Guide",
      category: "roof",
      href: "/guides/roof-material-comparison-guide/",
      source: "https://unitedmobilerv.com/guide/roof-material-comparison-guide/",
      tags: "roof material comparison guide"
    },
    {
      id: "roof-troubleshooting",
      title: "RV roof leak & seal troubleshooting",
      blurb: "Water damage is the silent killer of RVs — by the time you see a stain, it’s usually been sitting in the substrate for months. What to check, how to identify your roof…",
      kind: "Troubleshooting",
      category: "roof",
      href: "/guides/roof-troubleshooting/",
      source: "https://unitedmobilerv.com/guide/roof-troubleshooting/",
      tags: "roof troubleshooting"
    },
    {
      id: "roof-vent-fan-install-guide",
      title: "RV Roof Vent & Fan Install Guide",
      blurb: "A roof vent fan is one of the highest-value van build upgrades — and one of the easiest installs to turn into a future leak if the sealing isn’t done right.",
      kind: "Guide",
      category: "roof",
      href: "/guides/roof-vent-fan-install-guide/",
      source: "https://unitedmobilerv.com/guide/roof-vent-fan-install-guide/",
      tags: "roof vent fan install guide"
    },
    {
      id: "rv-fire-safety-guide",
      title: "RV Fire Safety & Extinguisher Guide",
      blurb: "RV OWNER’S FIELD GUIDE · CONNECTIVITY & SAFETY RV fires spread fast in a small, fuel- and propane-adjacent space — the margin between a contained incident and a total loss is…",
      kind: "Guide",
      category: "lp-gas",
      href: "/guides/rv-fire-safety-guide/",
      source: "https://unitedmobilerv.com/guide/rv-fire-safety-guide/",
      tags: "rv fire safety guide"
    },
    {
      id: "rv-furnace-troubleshooting-guide",
      title: "RV Furnace Troubleshooting Guide (Suburban & Atwood)",
      blurb: "Suburban and Atwood forced-air furnaces — the ducted heating system, not the water heater sharing the same brand name. This isolates the fault to ignition, not the blower motor.",
      kind: "Troubleshooting",
      category: "appliances",
      href: "/guides/rv-furnace-troubleshooting-guide/",
      source: "https://unitedmobilerv.com/guide/rv-furnace-troubleshooting-guide/",
      tags: "rv furnace troubleshooting guide sail switch suburban atwood"
    },
    {
      id: "rv-microwave-troubleshooting-guide",
      title: "RV Microwave & Convection Oven Troubleshooting Guide",
      blurb: "Built-in RV microwave/convection combos have a few failure patterns that are worth checking before assuming the unit is dead.",
      kind: "Troubleshooting",
      category: "appliances",
      href: "/guides/rv-microwave-troubleshooting-guide/",
      source: "https://unitedmobilerv.com/guide/rv-microwave-troubleshooting-guide/",
      tags: "rv microwave troubleshooting guide"
    },
    {
      id: "rv-storage-prep-guide",
      title: "RV Storage Prep & Pest Prevention Guide",
      blurb: "RV OWNER’S FIELD GUIDE · SEASONAL & TRAVEL A rig parked for the off-season isn’t just idle — it’s a target for rodents looking for shelter, batteries that drain and degrade…",
      kind: "Guide",
      category: "seasonal",
      href: "/guides/rv-storage-prep-guide/",
      source: "https://unitedmobilerv.com/guide/rv-storage-prep-guide/",
      tags: "rv storage prep guide"
    },
    {
      id: "seasonal-maintenance-checklist",
      title: "Seasonal maintenance checklist for RVs",
      blurb: "A quick reference for what to check each season, with links to the full guide for anything that needs more depth. This page won’t repeat what’s already covered elsewhere — it…",
      kind: "Guide",
      category: "seasonal",
      href: "/guides/seasonal-maintenance-checklist/",
      source: "https://unitedmobilerv.com/guide/seasonal-maintenance-checklist/",
      tags: "seasonal maintenance checklist"
    },
    {
      id: "slide-out-leveling-troubleshooting-guide",
      title: "Slide-out & leveling troubleshooting",
      blurb: "Before you condemn a Schwintek motor or a hydraulic jack pack, prove battery voltage at the controller and follow the manufacturer procedure for your exact system. Wrong manual…",
      kind: "Troubleshooting",
      category: "roof",
      href: "/guides/slide-out-leveling-troubleshooting-guide/",
      source: "https://unitedmobilerv.com/guide/slide-out-leveling-troubleshooting-guide/",
      tags: "slide out leveling troubleshooting guide"
    },
    {
      id: "slide-out-seal-guide",
      title: "Slide-Out Seal Replacement Guide",
      blurb: "A leaking slide-out is almost always a seal problem, an alignment problem, or both — here’s how to tell which.",
      kind: "Guide",
      category: "roof",
      href: "/guides/slide-out-seal-guide/",
      source: "https://unitedmobilerv.com/guide/slide-out-seal-guide/",
      tags: "slide out seal guide"
    },
    {
      id: "solar-battery-troubleshooting",
      title: "Solar & battery system troubleshooting",
      blurb: "Diagnose solar and house-bank problems by chemistry — LiFePO4 vs AGM, charge-controller stages, array faults, and when a Victron Professional install beats guesswork.",
      kind: "Troubleshooting",
      category: "power",
      href: "/guides/solar-battery-troubleshooting/",
      source: "https://unitedmobilerv.com/guide/solar-battery-troubleshooting/",
      tags: "solar battery troubleshooting"
    },
    {
      id: "solar-sizing-installation-guide",
      title: "RV Solar Panel Sizing & Installation Guide",
      blurb: "Most solar installs fail the owner not because the panels are bad, but because the system was sized to the roof instead of the actual daily power draw. Here’s how to size it…",
      kind: "Guide",
      category: "solar",
      href: "/guides/solar-sizing-installation-guide/",
      source: "https://unitedmobilerv.com/guide/solar-sizing-installation-guide/",
      tags: "solar sizing installation guide"
    },
    {
      id: "spring-dewinterization-checklist",
      title: "Spring de-winterization checklist",
      blurb: "RV OWNER’S FIELD GUIDE · SEASONAL, TRAVEL & MICHIGAN-SPECIFIC De-winterizing is winterizing in reverse, plus a full damage check — a rig that sat through a Michigan winter…",
      kind: "Guide",
      category: "seasonal",
      href: "/guides/spring-dewinterization-checklist/",
      source: "https://unitedmobilerv.com/guide/spring-dewinterization-checklist/",
      tags: "spring dewinterization checklist"
    },
    {
      id: "starlink-rv-guide",
      title: "Starlink for RVs — mount, power, and routing",
      blurb: "Satellite internet changed remote work on the road — but the RV-specific plan, mounting choice, and power draw have to match how you actually travel. United Mobile RV installs…",
      kind: "Guide",
      category: "wireless",
      href: "/guides/starlink-rv-guide/",
      source: "https://unitedmobilerv.com/guide/starlink-rv-guide/",
      tags: "starlink rv guide"
    },
    {
      id: "surge-protector-ems-guide",
      title: "Surge protector & EMS for RV pedestals",
      blurb: "The cheapest insurance policy in the entire RV, and one of the most skipped. Campground pedestal wiring varies wildly in age and quality.",
      kind: "Guide",
      category: "electrical",
      href: "/guides/surge-protector-ems-guide/",
      source: "https://unitedmobilerv.com/guide/surge-protector-ems-guide/",
      tags: "surge protector ems guide"
    },
    {
      id: "tank-sanitizing-guide",
      title: "RV fresh water tank sanitizing",
      blurb: "Worth doing at the start of every season, after storage, or any time the tank sat with stagnant water. The goal is a clean system you will actually drink from — not a chemistry…",
      kind: "Guide",
      category: "plumbing",
      href: "/guides/tank-sanitizing-guide/",
      source: "https://unitedmobilerv.com/guide/tank-sanitizing-guide/",
      tags: "tank sanitizing guide"
    },
    {
      id: "tank-sensor-troubleshooting-guide",
      title: "RV tank sensor troubleshooting",
      blurb: "“Black tank always reads full” is one of the most common complaints — and it is rarely the monitor panel electronics dying first. Fouling and probe type drive most false readings.",
      kind: "Troubleshooting",
      category: "plumbing",
      href: "/guides/tank-sensor-troubleshooting-guide/",
      source: "https://unitedmobilerv.com/guide/tank-sensor-troubleshooting-guide/",
      tags: "tank sensor troubleshooting guide"
    },
    {
      id: "tire-aging-guide",
      title: "RV tires age even when miles look low",
      blurb: "Trailers and coaches often sit in sun and heat. Sidewall aging and date codes matter as much as tread depth — sometimes more.",
      kind: "Guide",
      category: "chassis",
      href: "/guides/tire-aging-guide/",
      source: "https://unitedmobilerv.com/guide/tire-aging-guide/",
      tags: "tire aging guide"
    },
    {
      id: "tire-pressure-load-chart",
      title: "Tire pressure by load chart",
      blurb: "The number stamped on the sidewall is pressure at maximum load capacity — not automatically the right PSI for your measured axle weight. Use a scale ticket plus the tire…",
      kind: "Reference",
      category: "chassis",
      href: "/guides/tire-pressure-load-chart/",
      source: "https://unitedmobilerv.com/guide/tire-pressure-load-chart/",
      tags: "tire pressure load chart"
    },
    {
      id: "tires-brakes-tpms-guide",
      title: "Tires, brakes, and TPMS as one safety stack",
      blurb: "Corridor miles punish underinflation and weak trailer brakes. Treat tires, brakes, and TPMS together — not as separate shopping lists.",
      kind: "Guide",
      category: "chassis",
      href: "/guides/tires-brakes-tpms-guide/",
      source: "https://unitedmobilerv.com/guide/tires-brakes-tpms-guide/",
      tags: "tires brakes tpms guide"
    },
    {
      id: "toilet-systems-guide",
      title: "RV toilet systems",
      blurb: "Cassette vs permanent black-tank is a real tradeoff on vans and smaller rigs. Seals and winter care matter more than brand slogans.",
      kind: "Guide",
      category: "plumbing",
      href: "/guides/toilet-systems-guide/",
      source: "https://unitedmobilerv.com/guide/toilet-systems-guide/",
      tags: "toilet systems guide"
    },
    {
      id: "torque-spec-chart",
      title: "RV Fastener Torque Spec Chart — Lug Nuts, U-Bolts & Hangers",
      blurb: "Lug nuts, suspension U-bolts, and hanger/shackle bolts — the fasteners most responsible for a wheel or axle failure on the road. Covers travel trailers and fifth wheels through…",
      kind: "Reference",
      category: "reference",
      href: "/guides/torque-spec-chart/",
      source: "https://unitedmobilerv.com/guide/torque-spec-chart/",
      tags: "torque spec chart"
    },
    {
      id: "truma-combi-guide",
      title: "Truma Combi Furnace & Water Heater Troubleshooting Guide",
      blurb: "Combines space heating and water heating in one unit — increasingly common in van builds, and not well documented outside Europe. Here’s what to check.",
      kind: "Guide",
      category: "appliances",
      href: "/guides/truma-combi-guide/",
      source: "https://unitedmobilerv.com/guide/truma-combi-guide/",
      tags: "truma combi guide"
    },
    {
      id: "underbelly-insulation-guide",
      title: "RV Underbelly Insulation for Cold Weather",
      blurb: "Relevant reading before a Michigan winter, a U.P. run, or any cold-weather leg of a trip — most RVs are not built for it out of the box.",
      kind: "Guide",
      category: "seasonal",
      href: "/guides/underbelly-insulation-guide/",
      source: "https://unitedmobilerv.com/guide/underbelly-insulation-guide/",
      tags: "underbelly insulation guide"
    },
    {
      id: "van-build-electrical-troubleshooting",
      title: "Van Build & Skoolie Electrical Troubleshooting Guide",
      blurb: "DIY conversions have the widest range of electrical problems we see — because every build is different. Here’s how to think through a fault when there’s no factory wiring…",
      kind: "Troubleshooting",
      category: "electrical",
      href: "/guides/van-build-electrical-troubleshooting/",
      source: "https://unitedmobilerv.com/guide/van-build-electrical-troubleshooting/",
      tags: "van build electrical troubleshooting"
    },
    {
      id: "victron-fault-code-guide",
      title: "Victron fault codes & field diagnostics",
      blurb: "As a Victron Professional Certified Installer, we live in MultiPlus, Quattro, and SmartSolar systems daily. Read the alarm in VictronConnect or on the device first — then use…",
      kind: "Troubleshooting",
      category: "power",
      href: "/guides/victron-fault-code-guide/",
      source: "https://unitedmobilerv.com/guide/victron-fault-code-guide/",
      tags: "victron fault code guide"
    },
    {
      id: "water-filtration-guide",
      title: "RV water filtration systems",
      blurb: "Campground and well water quality varies wildly on the corridor. Match filter roles to the problem you actually have — sediment, taste/chemicals, or microbial risk — instead of…",
      kind: "Guide",
      category: "plumbing",
      href: "/guides/water-filtration-guide/",
      source: "https://unitedmobilerv.com/guide/water-filtration-guide/",
      tags: "water filtration guide"
    },
    {
      id: "water-heater-troubleshooting-guide",
      title: "RV water heater troubleshooting",
      blurb: "Most corridor coaches run Atwood/Dometic or Suburban-style heaters on LP, electric, or both. Start with fuel, power, and water path — not a made-up fault matrix.",
      kind: "Troubleshooting",
      category: "plumbing",
      href: "/guides/water-heater-troubleshooting-guide/",
      source: "https://unitedmobilerv.com/guide/water-heater-troubleshooting-guide/",
      tags: "water heater troubleshooting guide"
    },
    {
      id: "weboost-install-guide",
      title: "weBoost install — Authorized Installer, AGC honesty",
      blurb: "A cell booster does not create signal out of nothing — it amplifies whatever weak signal already reaches your roof antenna. Install it wrong and you can end up with worse…",
      kind: "Guide",
      category: "wireless",
      href: "/guides/weboost-install-guide/",
      source: "https://unitedmobilerv.com/guide/weboost-install-guide/",
      tags: "weboost install guide"
    },
    {
      id: "weighing-your-rig-guide",
      title: "Weigh your rig before the highway does",
      blurb: "GVWR stickers are not a substitute for a real scale ticket. Axle overload, soft tires, and mystery handling often start with “we thought we were under.”",
      kind: "Guide",
      category: "chassis",
      href: "/guides/weighing-your-rig-guide/",
      source: "https://unitedmobilerv.com/guide/weighing-your-rig-guide/",
      tags: "weighing your rig guide"
    },
    {
      id: "weight-distribution-hitch-guide",
      title: "Weight distribution hitch setup",
      blurb: "A weight distribution hitch that is installed but not adjusted correctly gives you none of the stability it promises. Setup is measured ride height and bar tension — not…",
      kind: "Guide",
      category: "chassis",
      href: "/guides/weight-distribution-hitch-guide/",
      source: "https://unitedmobilerv.com/guide/weight-distribution-hitch-guide/",
      tags: "weight distribution hitch guide"
    },
    {
      id: "window-seal-replacement-guide",
      title: "RV Window & Seal Replacement Guide",
      blurb: "A well-maintained roof doesn’t help if the leak is coming in around a window instead.",
      kind: "Guide",
      category: "roof",
      href: "/guides/window-seal-replacement-guide/",
      source: "https://unitedmobilerv.com/guide/window-seal-replacement-guide/",
      tags: "window seal replacement guide"
    },
    {
      id: "winterization-guide",
      title: "Winterize your RV before freeze damage",
      blurb: "Protect PEX, traps, and the water heater before freeze damage turns into spring archaeology. Blow-out vs antifreeze, bypass position, and when mobile winterize makes sense on…",
      kind: "Guide",
      category: "seasonal",
      href: "/guides/winterization-guide/",
      source: "https://unitedmobilerv.com/guide/winterization-guide/",
      tags: "winterization guide"
    },
    {
      id: "wire-ampacity-voltage-drop-chart",
      title: "12V DC Wire Ampacity & Voltage-Drop Chart (ABYC E-11)",
      blurb: "In low-voltage DC systems, voltage drop — not fire-safety ampacity — is usually what actually governs wire size. This chart covers both.",
      kind: "Reference",
      category: "electrical",
      href: "/guides/wire-ampacity-voltage-drop-chart/",
      source: "https://unitedmobilerv.com/guide/wire-ampacity-voltage-drop-chart/",
      tags: "wire ampacity voltage drop chart"
    },
    {
      id: "wireless-landing",
      title: "Wireless and connectivity",
      blurb: "Starlink, weBoost, and Peplink installs as a system on the main-site wireless landing.",
      kind: "Guide",
      category: "wireless",
      href: "",
      source: "https://unitedmobilerv.com/wireless/",
      tags: "wireless peplink starlink weboost"
    },
    {
      id: "lithium-buying",
      title: "Lithium battery buying guide",
      blurb: "How to compare packs before you spend — source page, not duplicated here.",
      kind: "Guide",
      category: "solar",
      href: "",
      source: "https://unitedmobilerv.com/lithium-battery-buying-guide/",
      tags: "lithium battery buying"
    },
    {
      id: "cancellation-no-show-policy",
      title: "Cancellation and no-show policy",
      blurb: "Job form. PDF download — not a Field Guide.",
      kind: "Policy",
      category: "policies",
      href: "",
      pdf: "/policies/cancellation-no-show-policy.pdf",
      source: "",
      tags: "cancellation no-show policy form download pdf"
    },
    {
      id: "service-estimate",
      title: "Service estimate",
      blurb: "Estimate template. PDF download — not a Field Guide.",
      kind: "Policy",
      category: "policies",
      href: "",
      pdf: "/policies/service-estimate.pdf",
      source: "",
      tags: "service estimate template form download pdf"
    },
    {
      id: "invoice",
      title: "Invoice",
      blurb: "Invoice template. PDF download — not a Field Guide.",
      kind: "Policy",
      category: "policies",
      href: "",
      pdf: "/policies/invoice.pdf",
      source: "",
      tags: "invoice template form download pdf"
    },
    {
      id: "service-agreement",
      title: "Service agreement",
      blurb: "Work authorization and liability waiver. PDF download — not a Field Guide.",
      kind: "Policy",
      category: "policies",
      href: "",
      pdf: "/policies/service-agreement.pdf",
      source: "",
      tags: "service agreement work authorization liability waiver form download pdf"
    },
    {
      id: "limitation-of-liability-waiver",
      title: "Limitation of liability waiver",
      blurb: "Liability waiver. PDF download — not a Field Guide.",
      kind: "Policy",
      category: "policies",
      href: "",
      pdf: "/policies/limitation-of-liability-waiver.pdf",
      source: "",
      tags: "limitation of liability waiver form download pdf"
    }
  ];

  function categoryLabel(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) return CATEGORIES[i].label;
    }
    return id;
  }

  function haystack(entry) {
    return [
      entry.title,
      entry.blurb,
      entry.kind,
      categoryLabel(entry.category),
      entry.tags,
      entry.href,
      entry.pdf,
      entry.source
    ].join(' ').toLowerCase();
  }

  function params() {
    var q = new URLSearchParams(location.search);
    return {
      q: (q.get('q') || '').trim(),
      cat: q.get('cat') || 'all'
    };
  }

  function writeParams(q, cat) {
    var next = new URLSearchParams();
    if (q) next.set('q', q);
    if (cat && cat !== 'all') next.set('cat', cat);
    var qs = next.toString();
    var url = location.pathname + (qs ? '?' + qs : '') + location.hash;
    history.replaceState(null, '', url);
  }

  function matches(entry, q, cat) {
    if (cat && cat !== 'all' && entry.category !== cat) return false;
    if (!q) return true;
    return haystack(entry).indexOf(q.toLowerCase()) !== -1;
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== '') {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    if (text) node.textContent = text;
    return node;
  }

  function card(entry) {
    var li = el('li', { class: 'catalog-card', 'data-id': entry.id, 'data-category': entry.category });
    var top = el('div', { class: 'catalog-card-top' });
    var h3 = el('h3');
    var primary = entry.href || entry.pdf || entry.source;
    h3.appendChild(el('a', { href: primary }, entry.title));
    top.appendChild(h3);
    top.appendChild(el('span', { class: 'catalog-kind' }, entry.kind));
    li.appendChild(top);
    li.appendChild(el('p', null, entry.blurb));
    var links = el('div', { class: 'catalog-links' });
    if (entry.href) {
      links.appendChild(el('a', { href: entry.href }, 'Read on docs'));
    }
    if (entry.pdf) {
      links.appendChild(el('a', { href: entry.pdf }, 'Download PDF'));
    }
    if (entry.source) {
      links.appendChild(el('a', { href: entry.source }, entry.href ? 'Source page' : 'Open source page'));
    }
    li.appendChild(links);
    return li;
  }

  function publishedForumPins() {
    return Object.keys(FORUM_PINS).filter(function (k) {
      return FORUM_PINS[k].href;
    }).map(function (k) {
      return FORUM_PINS[k];
    });
  }

  function renderForumPins(root) {
    var pins = publishedForumPins();
    if (!pins.length) return;
    var row = el('p', { class: 'catalog-quiet', id: 'catalog-forum-pins' });
    row.appendChild(document.createTextNode('Forum pins: '));
    pins.forEach(function (pin, i) {
      if (i) row.appendChild(document.createTextNode(' · '));
      row.appendChild(el('a', { href: pin.href }, pin.label));
    });
    root.appendChild(row);
  }

  function render(root) {
    var state = params();
    if (!state.cat || state.cat === 'all') {
      var preset = root.getAttribute('data-default-cat');
      if (preset) state.cat = preset;
    }
    if (CATEGORIES.every(function (c) { return c.id !== state.cat; })) state.cat = 'all';

    root.innerHTML = '';

    var searchWrap = el('div', { class: 'catalog-search' });
    var label = el('label', { for: 'catalog-q' }, 'Search guides, troubleshooting, and policies');
    var input = el('input', {
      id: 'catalog-q',
      type: 'search',
      name: 'q',
      value: state.q,
      placeholder: 'Furnace, cancellation, invoice, Starlink…',
      autocomplete: 'off'
    });
    searchWrap.appendChild(label);
    searchWrap.appendChild(input);
    root.appendChild(searchWrap);

    var chips = el('ul', { class: 'catalog-chips', role: 'list' });
    CATEGORIES.forEach(function (cat) {
      var li = el('li');
      var btn = el('button', {
        type: 'button',
        'data-cat': cat.id,
        'aria-pressed': cat.id === state.cat ? 'true' : 'false'
      }, cat.label);
      li.appendChild(btn);
      chips.appendChild(li);
    });
    root.appendChild(chips);

    var meta = el('p', { class: 'catalog-meta', id: 'catalog-count' });
    root.appendChild(meta);

    var empty = el('p', { class: 'catalog-empty', id: 'catalog-empty', hidden: 'hidden' }, 'No matching guides, troubleshooting notes, or policies.');
    root.appendChild(empty);

    var lists = {};
    CATEGORIES.slice(1).forEach(function (cat) {
      var section = el('section', { class: 'catalog-section', 'data-section': cat.id });
      section.appendChild(el('h2', null, cat.label));
      var ul = el('ul', { class: 'catalog-list' });
      section.appendChild(ul);
      root.appendChild(section);
      lists[cat.id] = { section: section, ul: ul };
    });

    ENTRIES.forEach(function (entry) {
      lists[entry.category].ul.appendChild(card(entry));
    });

    function apply() {
      var q = input.value.trim();
      var cat = state.cat;
      var shown = 0;
      ENTRIES.forEach(function (entry) {
        var node = root.querySelector('[data-id="' + entry.id + '"]');
        var ok = matches(entry, q, cat);
        if (node) node.hidden = !ok;
        if (ok) shown += 1;
      });
      Object.keys(lists).forEach(function (id) {
        var any = false;
        var items = lists[id].ul.querySelectorAll('.catalog-card');
        for (var i = 0; i < items.length; i++) {
          if (!items[i].hidden) { any = true; break; }
        }
        lists[id].section.hidden = !any;
      });
      empty.hidden = shown !== 0;
      var catNote = cat === 'all' ? '' : ' in ' + categoryLabel(cat);
      meta.textContent = shown + (shown === 1 ? ' entry' : ' entries') + catNote + (q ? ' matching “' + q + '”' : '') + '.';
      writeParams(q, cat);
    }

    input.addEventListener('input', apply);
    chips.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-cat]');
      if (!btn) return;
      state.cat = btn.getAttribute('data-cat');
      var buttons = chips.querySelectorAll('button[data-cat]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('aria-pressed', buttons[i] === btn ? 'true' : 'false');
      }
      apply();
    });

    apply();
    renderForumPins(root);
    window.UMRT_DOCS_CATALOG = {
      CATEGORIES: CATEGORIES,
      ENTRIES: ENTRIES,
      FORUM_PINS: FORUM_PINS,
      matches: matches
    };
  }

  var mount = document.getElementById('docs-catalog');
  if (mount) render(mount);
})();
