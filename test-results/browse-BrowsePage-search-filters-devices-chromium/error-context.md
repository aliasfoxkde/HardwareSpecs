# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: browse.spec.ts >> BrowsePage >> search filters devices
- Location: e2e/browse.spec.ts:10:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('Search devices') resolved to 2 elements:
    1) <input value="" type="text" aria-label="Search devices" placeholder="Search devices..." class="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"/> aka getByPlaceholder('Search devices...')
    2) <input value="" type="text" aria-label="Search devices" placeholder="Search by name, vendor, or family..." class="w-full px-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"/> aka getByPlaceholder('Search by name, vendor, or')

Call log:
  - waiting for getByLabel('Search devices')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - navigation "Main navigation" [ref=e5]:
    - generic [ref=e7]:
      - link "SiliconRank SiliconRank" [ref=e8] [cursor=pointer]:
        - /url: /
        - img "SiliconRank" [ref=e9]
        - generic [ref=e10]: SiliconRank
      - generic [ref=e11]:
        - link "Home" [ref=e12] [cursor=pointer]:
          - /url: /
        - link "Browse" [ref=e13] [cursor=pointer]:
          - /url: /browse
        - link "Compare" [ref=e14] [cursor=pointer]:
          - /url: /compare
        - link "Charts" [ref=e15] [cursor=pointer]:
          - /url: /charts
        - link "Studio" [ref=e16] [cursor=pointer]:
          - /url: /studio
        - link "Tools" [ref=e17] [cursor=pointer]:
          - /url: /tools
        - link "Reports" [ref=e18] [cursor=pointer]:
          - /url: /reports
        - link "Docs" [ref=e19] [cursor=pointer]:
          - /url: /docs
      - generic [ref=e20]:
        - textbox "Search devices" [ref=e24]:
          - /placeholder: Search devices...
        - 'button "Theme: auto. Click to switch." [ref=e25]'
  - main [ref=e28]:
    - generic [ref=e29]:
      - generic [ref=e31]:
        - heading "Browse Devices" [level=1] [ref=e32]
        - status [ref=e33]: 304 devices found
      - generic [ref=e34]:
        - textbox "Search devices" [ref=e35]:
          - /placeholder: Search by name, vendor, or family...
        - generic [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]: TDP
            - slider "Minimum TDP" [ref=e39]: "0"
            - generic [ref=e40]: 0W
            - generic [ref=e41]: –
            - slider "Maximum TDP" [ref=e42]: "700"
            - generic [ref=e43]: ∞
          - generic [ref=e44]:
            - generic [ref=e45]: Price
            - slider "Minimum price" [ref=e46]: "0"
            - generic [ref=e47]: $0
            - generic [ref=e48]: –
            - slider "Maximum price" [ref=e49]: "50000"
            - generic [ref=e50]: ∞
        - generic [ref=e51]:
          - button "CPU" [ref=e52]
          - button "GPU" [ref=e53]
          - button "SBC" [ref=e54]
          - button "NPU" [ref=e55]
          - button "ASIC" [ref=e56]
          - button "SoC" [ref=e57]
          - button "System" [ref=e58]
          - button "AMD" [ref=e59]
          - button "Intel" [ref=e60]
          - button "Apple" [ref=e61]
          - button "Qualcomm" [ref=e62]
          - button "NVIDIA" [ref=e63]
          - button "Raspberry Pi Foundation" [ref=e64]
          - button "Radxa" [ref=e65]
          - button "HardKernel" [ref=e66]
          - button "BeagleBoard.org" [ref=e67]
          - button "Xunlong Software" [ref=e68]
          - button "Google" [ref=e69]
          - button "Hailo Technologies" [ref=e70]
          - button "FriendlyELEC" [ref=e71]
          - button "Ampere Computing" [ref=e72]
          - button "Amazon Web Services" [ref=e73]
          - button "Groq" [ref=e74]
          - button "Cerebras Systems" [ref=e75]
          - button "Valve Corporation" [ref=e76]
          - button "ASUS" [ref=e77]
          - button "Lenovo" [ref=e78]
          - button "MediaTek" [ref=e79]
          - button "Libre Computer" [ref=e80]
          - button "Samsung" [ref=e81]
          - button "Western Digital" [ref=e82]
          - button "Crucial (Micron)" [ref=e83]
          - button "SK Hynix" [ref=e84]
          - button "G.Skill" [ref=e85]
          - button "Corsair" [ref=e86]
          - button "NVIDIA Enterprise" [ref=e87]
          - button "Intel Arc" [ref=e88]
          - button "Rockchip" [ref=e89]
          - button "Huawei" [ref=e90]
          - button "Broadcom" [ref=e91]
          - generic [ref=e92]:
            - button "Export CSV" [ref=e93]: CSV
            - button "Export JSON" [ref=e94]: JSON
      - generic [ref=e95]:
        - table "Device list" [ref=e97]:
          - rowgroup [ref=e98]:
            - row [ref=e99]:
              - columnheader "Device ↕" [ref=e100] [cursor=pointer]:
                - generic [ref=e101]:
                  - text: Device
                  - generic [ref=e102]: ↕
              - columnheader "Launch ↓" [ref=e103] [cursor=pointer]:
                - generic [ref=e104]:
                  - text: Launch
                  - generic [ref=e105]: ↓
              - columnheader "RAM ↕" [ref=e106] [cursor=pointer]:
                - generic [ref=e107]:
                  - text: RAM
                  - generic [ref=e108]: ↕
              - columnheader "RAM/$ ↕" [ref=e109] [cursor=pointer]:
                - generic [ref=e110]:
                  - text: RAM/$
                  - generic [ref=e111]: ↕
              - columnheader "INT8 TOPS ↕" [ref=e112] [cursor=pointer]:
                - generic [ref=e113]:
                  - text: INT8 TOPS
                  - generic [ref=e114]: ↕
              - columnheader "TOPS/$ ↕" [ref=e115] [cursor=pointer]:
                - generic [ref=e116]:
                  - text: TOPS/$
                  - generic [ref=e117]: ↕
              - columnheader "TOPS/W ↕" [ref=e118] [cursor=pointer]:
                - generic [ref=e119]:
                  - text: TOPS/W
                  - generic [ref=e120]: ↕
              - columnheader "Perf/$ ↕" [ref=e121] [cursor=pointer]:
                - generic [ref=e122]:
                  - text: Perf/$
                  - generic [ref=e123]: ↕
              - columnheader "TDP ↕" [ref=e124] [cursor=pointer]:
                - generic [ref=e125]:
                  - text: TDP
                  - generic [ref=e126]: ↕
              - columnheader "Price ↕" [ref=e127] [cursor=pointer]:
                - generic [ref=e128]:
                  - text: Price
                  - generic [ref=e129]: ↕
              - columnheader "Data ↕" [ref=e130] [cursor=pointer]:
                - generic [ref=e131]:
                  - text: Data
                  - generic [ref=e132]: ↕
          - rowgroup [ref=e133]:
            - row [ref=e134]:
              - cell [ref=e135]:
                - link "NVIDIA GeForce RTX 5060 Ti 16 GB" [ref=e136] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5060-ti-16gb
              - cell "2025-07" [ref=e137]
              - cell "16 GB" [ref=e138]
              - cell "0.04" [ref=e139]
              - cell "-" [ref=e140]
              - cell "-" [ref=e141]
              - cell "-" [ref=e142]
              - cell "0" [ref=e143]
              - cell "180W" [ref=e144]
              - cell "$449" [ref=e145]
              - cell "47%" [ref=e146]
            - row [ref=e151]:
              - cell [ref=e152]:
                - link "NVIDIA GeForce RTX 5060 Ti 8 GB" [ref=e153] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5060-ti-8gb
              - cell "2025-07" [ref=e154]
              - cell "8 GB" [ref=e155]
              - cell "0.02" [ref=e156]
              - cell "168.45" [ref=e157]
              - cell "0.42" [ref=e158]
              - cell "0.94" [ref=e159]
              - cell "0" [ref=e160]
              - cell "180W" [ref=e161]
              - cell "$399" [ref=e162]
              - cell "53%" [ref=e163]
            - row [ref=e168]:
              - cell [ref=e169]:
                - link "NVIDIA GeForce RTX 5060" [ref=e170] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5060
              - cell "2025-07" [ref=e171]
              - cell "8 GB" [ref=e172]
              - cell "0.03" [ref=e173]
              - cell "-" [ref=e174]
              - cell "-" [ref=e175]
              - cell "-" [ref=e176]
              - cell "0" [ref=e177]
              - cell "150W" [ref=e178]
              - cell "$299" [ref=e179]
              - cell "47%" [ref=e180]
            - row [ref=e185]:
              - cell [ref=e186]:
                - link "NVIDIA GeForce RTX 5050" [ref=e187] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5050
              - cell "2025-07" [ref=e188]
              - cell "8 GB" [ref=e189]
              - cell "0.03" [ref=e190]
              - cell "112.91" [ref=e191]
              - cell "0.45" [ref=e192]
              - cell "0.75" [ref=e193]
              - cell "0" [ref=e194]
              - cell "150W" [ref=e195]
              - cell "$249" [ref=e196]
              - cell "53%" [ref=e197]
            - row [ref=e202]:
              - cell [ref=e203]:
                - link "NVIDIA RTX PRO 6000 Blackwell" [ref=e204] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-pro-6000-blackwell
              - cell "2025-07" [ref=e205]
              - cell "48 GB" [ref=e206]
              - cell "0.01" [ref=e207]
              - cell "-" [ref=e208]
              - cell "-" [ref=e209]
              - cell "-" [ref=e210]
              - cell "0" [ref=e211]
              - cell "350W" [ref=e212]
              - cell "$5,500" [ref=e213]
              - cell "47%" [ref=e214]
            - row [ref=e219]:
              - cell [ref=e220]:
                - link "AMD Radeon RX 9060 XT 16 GB" [ref=e221] [cursor=pointer]:
                  - /url: /device/amd-rx-9060-xt-16gb
              - cell "2025-07" [ref=e222]
              - cell "16 GB" [ref=e223]
              - cell "0.04" [ref=e224]
              - cell "112.91" [ref=e225]
              - cell "0.31" [ref=e226]
              - cell "0.63" [ref=e227]
              - cell "0" [ref=e228]
              - cell "180W" [ref=e229]
              - cell "$359" [ref=e230]
              - cell "53%" [ref=e231]
            - row [ref=e236]:
              - cell [ref=e237]:
                - link "AMD Radeon RX 9060 XT 8 GB" [ref=e238] [cursor=pointer]:
                  - /url: /device/amd-rx-9060-xt-8gb
              - cell "2025-07" [ref=e239]
              - cell "8 GB" [ref=e240]
              - cell "0.03" [ref=e241]
              - cell "112.91" [ref=e242]
              - cell "0.38" [ref=e243]
              - cell "0.63" [ref=e244]
              - cell "0" [ref=e245]
              - cell "180W" [ref=e246]
              - cell "$299" [ref=e247]
              - cell "53%" [ref=e248]
            - row [ref=e253]:
              - cell [ref=e254]:
                - link "ASUS ROG Ally X" [ref=e255] [cursor=pointer]:
                  - /url: /device/asus-rog-ally-x
              - cell "2025-06-11" [ref=e256]
              - cell "24 GB" [ref=e257]
              - cell "0.03" [ref=e258]
              - cell "0.01" [ref=e259]
              - cell "0.00" [ref=e260]
              - cell "0.00" [ref=e261]
              - cell "11" [ref=e262]
              - cell "30W" [ref=e263]
              - cell "$799" [ref=e264]
              - cell "73%" [ref=e265]
            - row [ref=e270]:
              - cell [ref=e271]:
                - link "NVIDIA B200 192GB" [ref=e272] [cursor=pointer]:
                  - /url: /device/nvidia-b200
              - cell "2025-06-01" [ref=e273]
              - cell "192 GB" [ref=e274]
              - cell "0.00" [ref=e275]
              - cell "918" [ref=e276]
              - cell "0.02" [ref=e277]
              - cell "0.92" [ref=e278]
              - cell "0" [ref=e279]
              - cell "1000W" [ref=e280]
              - cell "$40,000" [ref=e281]
              - cell "53%" [ref=e282]
            - row [ref=e287]:
              - cell [ref=e288]:
                - link "Lenovo Legion Go S (Snapdragon X Elite)" [ref=e289] [cursor=pointer]:
                  - /url: /device/lenovo-legion-go-snapdragon-x
              - cell "2025-06-01" [ref=e290]
              - cell "64 GB" [ref=e291]
              - cell "0.11" [ref=e292]
              - cell "0.02" [ref=e293]
              - cell "0.00" [ref=e294]
              - cell "0.00" [ref=e295]
              - cell "20" [ref=e296]
              - cell "23W" [ref=e297]
              - cell "$599" [ref=e298]
              - cell "73%" [ref=e299]
            - row [ref=e304]:
              - cell [ref=e305]:
                - link "NVIDIA GeForce RTX 5070 Ti" [ref=e306] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5070-ti
              - cell "2025-03-20" [ref=e307]
              - cell "16 GB" [ref=e308]
              - cell "0.02" [ref=e309]
              - cell "1.13k" [ref=e310]
              - cell "1.50" [ref=e311]
              - cell "3.75" [ref=e312]
              - cell "0" [ref=e313]
              - cell "300W" [ref=e314]
              - cell "$749" [ref=e315]
              - cell "60%" [ref=e316]
            - row [ref=e321]:
              - cell [ref=e322]:
                - link "NVIDIA GeForce RTX 5070" [ref=e323] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5070
              - cell "2025-03-20" [ref=e324]
              - cell "12 GB" [ref=e325]
              - cell "0.02" [ref=e326]
              - cell "771" [ref=e327]
              - cell "1.40" [ref=e328]
              - cell "3.08" [ref=e329]
              - cell "0" [ref=e330]
              - cell "250W" [ref=e331]
              - cell "$549" [ref=e332]
              - cell "60%" [ref=e333]
            - row [ref=e338]:
              - cell [ref=e339]:
                - link "NVIDIA DGX Spark" [ref=e340] [cursor=pointer]:
                  - /url: /device/nvidia-dgx-spark
              - cell "2025-03-17" [ref=e341]
              - cell "128 GB" [ref=e342]
              - cell "0.03" [ref=e343]
              - cell "114.75" [ref=e344]
              - cell "0.03" [ref=e345]
              - cell "1.15" [ref=e346]
              - cell "8" [ref=e347]
              - cell "100W" [ref=e348]
              - cell "$3,999" [ref=e349]
              - cell "67%" [ref=e350]
            - row [ref=e355]:
              - cell [ref=e356]:
                - link "AMD Ryzen 9 9950X3D" [ref=e357] [cursor=pointer]:
                  - /url: /device/amd-ryzen-9-9950x3d
              - cell "2025-03-15" [ref=e358]
              - cell "64 GB" [ref=e359]
              - cell "0.10" [ref=e360]
              - cell "0.47" [ref=e361]
              - cell "0.00" [ref=e362]
              - cell "0.00" [ref=e363]
              - cell "35" [ref=e364]
              - cell "170W" [ref=e365]
              - cell "$649" [ref=e366]
              - cell "67%" [ref=e367]
            - row [ref=e372]:
              - cell [ref=e373]:
                - link "AMD Ryzen 9 9900X3D" [ref=e374] [cursor=pointer]:
                  - /url: /device/amd-ryzen-9-9900x3d
              - cell "2025-03-15" [ref=e375]
              - cell "64 GB" [ref=e376]
              - cell "0.14" [ref=e377]
              - cell "0.39" [ref=e378]
              - cell "0.00" [ref=e379]
              - cell "0.00" [ref=e380]
              - cell "43" [ref=e381]
              - cell "120W" [ref=e382]
              - cell "$449" [ref=e383]
              - cell "67%" [ref=e384]
            - row [ref=e389]:
              - cell [ref=e390]:
                - link "Apple M3 Ultra" [ref=e391] [cursor=pointer]:
                  - /url: /device/apple-m3-ultra
              - cell "2025-03-12" [ref=e392]
              - cell "128 GB" [ref=e393]
              - cell "0.02" [ref=e394]
              - cell "0.02" [ref=e395]
              - cell "0.00" [ref=e396]
              - cell "0.00" [ref=e397]
              - cell "5" [ref=e398]
              - cell "180W" [ref=e399]
              - cell "$5,999" [ref=e400]
              - cell "73%" [ref=e401]
            - row [ref=e406]:
              - cell [ref=e407]:
                - link "AMD Radeon RX 9070 XT" [ref=e408] [cursor=pointer]:
                  - /url: /device/amd-rx-9070-xt
              - cell "2025-03-12" [ref=e409]
              - cell "16 GB" [ref=e410]
              - cell "0.03" [ref=e411]
              - cell "28" [ref=e412]
              - cell "0.05" [ref=e413]
              - cell "0.09" [ref=e414]
              - cell "0" [ref=e415]
              - cell "300W" [ref=e416]
              - cell "$549" [ref=e417]
              - cell "53%" [ref=e418]
            - row [ref=e423]:
              - cell [ref=e424]:
                - link "AMD Radeon RX 9070" [ref=e425] [cursor=pointer]:
                  - /url: /device/amd-rx-9070
              - cell "2025-03-12" [ref=e426]
              - cell "16 GB" [ref=e427]
              - cell "0.04" [ref=e428]
              - cell "-" [ref=e429]
              - cell "-" [ref=e430]
              - cell "-" [ref=e431]
              - cell "0" [ref=e432]
              - cell "250W" [ref=e433]
              - cell "$449" [ref=e434]
              - cell "47%" [ref=e435]
            - row [ref=e440]:
              - cell [ref=e441]:
                - link "Apple M4 Ultra (128GB)" [ref=e442] [cursor=pointer]:
                  - /url: /device/apple-m4-ultra-128gb
              - cell "2025-03" [ref=e443]
              - cell "128 GB" [ref=e444]
              - cell "0.02" [ref=e445]
              - cell "34.88" [ref=e446]
              - cell "0.01" [ref=e447]
              - cell "0.25" [ref=e448]
              - cell "6" [ref=e449]
              - cell "140W" [ref=e450]
              - cell "$5,999" [ref=e451]
              - cell "33%" [ref=e452]
            - row [ref=e457]:
              - cell [ref=e458]:
                - link "Apple M4 Ultra (192GB)" [ref=e459] [cursor=pointer]:
                  - /url: /device/apple-m4-ultra-192gb
              - cell "2025-03" [ref=e460]
              - cell "192 GB" [ref=e461]
              - cell "0.03" [ref=e462]
              - cell "34.88" [ref=e463]
              - cell "0.00" [ref=e464]
              - cell "0.19" [ref=e465]
              - cell "5" [ref=e466]
              - cell "180W" [ref=e467]
              - cell "$6,999" [ref=e468]
              - cell "33%" [ref=e469]
            - row [ref=e474]:
              - cell [ref=e475]:
                - link "Raspberry Pi 500 (with AI Kit)" [ref=e476] [cursor=pointer]:
                  - /url: /device/raspberry-pi-500
              - cell "2025-02-10" [ref=e477]
              - cell "8 GB" [ref=e478]
              - cell "0.07" [ref=e479]
              - cell "4.79" [ref=e480]
              - cell "0.04" [ref=e481]
              - cell "0.40" [ref=e482]
              - cell "13" [ref=e483]
              - cell "12W" [ref=e484]
              - cell "$120" [ref=e485]
              - cell "73%" [ref=e486]
            - row [ref=e491]:
              - cell [ref=e492]:
                - link "NVIDIA GeForce RTX 5090" [ref=e493] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5090
              - cell "2025-01-30" [ref=e494]
              - cell "32 GB" [ref=e495]
              - cell "0.02" [ref=e496]
              - cell "769.28" [ref=e497]
              - cell "0.38" [ref=e498]
              - cell "1.34" [ref=e499]
              - cell "0" [ref=e500]
              - cell "575W" [ref=e501]
              - cell "$1,999" [ref=e502]
              - cell "60%" [ref=e503]
            - row [ref=e508]:
              - cell [ref=e509]:
                - link "NVIDIA GeForce RTX 5080" [ref=e510] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5080
              - cell "2025-01-30" [ref=e511]
              - cell "16 GB" [ref=e512]
              - cell "0.02" [ref=e513]
              - cell "901" [ref=e514]
              - cell "0.90" [ref=e515]
              - cell "2.50" [ref=e516]
              - cell "0" [ref=e517]
              - cell "360W" [ref=e518]
              - cell "$999" [ref=e519]
              - cell "47%" [ref=e520]
            - row [ref=e525]:
              - cell [ref=e526]:
                - link "Intel Core Ultra 200S" [ref=e527] [cursor=pointer]:
                  - /url: /device/intel-core-ultra-200s
              - cell "2025-01" [ref=e528]
              - cell "64 GB" [ref=e529]
              - cell "0.26" [ref=e530]
              - cell "0.53" [ref=e531]
              - cell "0.00" [ref=e532]
              - cell "0.01" [ref=e533]
              - cell "63" [ref=e534]
              - cell "65W" [ref=e535]
              - cell "$249" [ref=e536]
              - cell "67%" [ref=e537]
            - row [ref=e542]:
              - cell [ref=e543]:
                - link "NVIDIA B200 192GB" [ref=e544] [cursor=pointer]:
                  - /url: /device/nvidia-b200-192gb
              - cell "2025-01" [ref=e545]
              - cell "192 GB" [ref=e546]
              - cell "0.00" [ref=e547]
              - cell "-" [ref=e548]
              - cell "-" [ref=e549]
              - cell "-" [ref=e550]
              - cell "0" [ref=e551]
              - cell "1000W" [ref=e552]
              - cell "$40,000" [ref=e553]
              - cell "27%" [ref=e554]
        - generic [ref=e559]:
          - generic [ref=e560]: Showing 1-25 of 304
          - generic [ref=e561]:
            - button "Previous page" [disabled] [ref=e562]: Previous
            - button "Page 1" [ref=e563]: "1"
            - button "Page 2" [ref=e564]: "2"
            - button "Page 3" [ref=e565]: "3"
            - button "Page 4" [ref=e566]: "4"
            - button "Page 5" [ref=e567]: "5"
            - button "Next page" [ref=e568]: Next
  - contentinfo "Site footer" [ref=e569]:
    - generic [ref=e570]:
      - generic [ref=e571]:
        - generic [ref=e572]:
          - generic [ref=e573]: SiliconRank
          - paragraph [ref=e575]: Open hardware intelligence platform. Compare CPUs, GPUs, NPUs, and AI accelerators.
        - generic [ref=e576]:
          - heading "Explore" [level=4] [ref=e577]
          - generic [ref=e578]:
            - link "Browse Devices" [ref=e579] [cursor=pointer]:
              - /url: /browse
            - link "Compare" [ref=e580] [cursor=pointer]:
              - /url: /compare
            - link "Charts" [ref=e581] [cursor=pointer]:
              - /url: /charts
            - link "Studio" [ref=e582] [cursor=pointer]:
              - /url: /studio
            - link "Tools" [ref=e583] [cursor=pointer]:
              - /url: /tools
            - link "Reports" [ref=e584] [cursor=pointer]:
              - /url: /reports
            - link "API Docs" [ref=e585] [cursor=pointer]:
              - /url: /docs
        - generic [ref=e586]:
          - heading "Categories" [level=4] [ref=e587]
          - generic [ref=e588]:
            - link "CPUs" [ref=e589] [cursor=pointer]:
              - /url: /browse?category=CPU
            - link "GPUs" [ref=e590] [cursor=pointer]:
              - /url: /browse?category=GPU
            - link "NPUs / AI" [ref=e591] [cursor=pointer]:
              - /url: /browse?category=NPU
            - link "SBCs" [ref=e592] [cursor=pointer]:
              - /url: /browse?category=SBC
            - link "Memory" [ref=e593] [cursor=pointer]:
              - /url: /browse?category=Memory
            - link "Storage" [ref=e594] [cursor=pointer]:
              - /url: /browse?category=Storage
        - generic [ref=e595]:
          - heading "Project" [level=4] [ref=e596]
          - generic [ref=e597]:
            - link "GitHub" [ref=e598] [cursor=pointer]:
              - /url: https://github.com/aliasfoxkde/HardwareSpecs
            - generic [ref=e601]: Open Source (MIT)
            - generic [ref=e602]: 304 devices · 35 vendors
      - generic [ref=e604]:
        - generic [ref=e605]: SiliconRank © 2026 · Open source under MIT License
        - generic [ref=e606]:
          - link "Sponsor" [ref=e607] [cursor=pointer]:
            - /url: https://github.com/sponsors/aliasfoxkde
          - link "Ko-fi" [ref=e610] [cursor=pointer]:
            - /url: https://ko-fi.com/aliasfoxkde
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.describe('BrowsePage', () => {
  4   |   test('loads and displays device table', async ({ page }) => {
  5   |     await page.goto('/browse')
  6   |     await expect(page.getByRole('heading', { name: /browse/i })).toBeVisible()
  7   |     await expect(page.getByRole('table', { name: /device list/i })).toBeVisible()
  8   |   })
  9   | 
  10  |   test('search filters devices', async ({ page }) => {
  11  |     await page.goto('/browse')
  12  |     const searchInput = page.getByLabel('Search devices')
> 13  |     await searchInput.fill('NVIDIA')
      |                       ^ Error: locator.fill: Error: strict mode violation: getByLabel('Search devices') resolved to 2 elements:
  14  |     await page.waitForTimeout(300)
  15  |     // Results should update
  16  |     await expect(page.getByRole('status')).toBeVisible()
  17  |   })
  18  | 
  19  |   test('category filters work', async ({ page }) => {
  20  |     await page.goto('/browse')
  21  |     const gpuButton = page.getByRole('button', { name: 'GPU' })
  22  |     await gpuButton.click()
  23  |     await page.waitForTimeout(100)
  24  |     await expect(gpuButton.getAttribute('aria-pressed')).toBe('true')
  25  |   })
  26  | 
  27  |   test('export CSV button exists', async ({ page }) => {
  28  |     await page.goto('/browse')
  29  |     await expect(page.getByLabel('Export CSV')).toBeVisible()
  30  |   })
  31  | 
  32  |   test('export JSON button exists', async ({ page }) => {
  33  |     await page.goto('/browse')
  34  |     await expect(page.getByLabel('Export JSON')).toBeVisible()
  35  |   })
  36  | })
  37  | 
  38  | test.describe('DevicePage', () => {
  39  |   test('loads device details', async ({ page }) => {
  40  |     await page.goto('/device/nvidia-geforce-rtx-4090')
  41  |     await expect(page.getByRole('heading')).toBeVisible()
  42  |   })
  43  | 
  44  |   test('back to browse link works', async ({ page }) => {
  45  |     await page.goto('/device/nvidia-geforce-rtx-4090')
  46  |     const backLink = page.getByRole('link', { name: /back to browse/i })
  47  |     await expect(backLink).toBeVisible()
  48  |   })
  49  | })
  50  | 
  51  | test.describe('LandingPage', () => {
  52  |   test('loads and displays hero', async ({ page }) => {
  53  |     await page.goto('/')
  54  |     await expect(page.getByRole('heading', { name: /siliconrank/i })).toBeVisible()
  55  |   })
  56  | 
  57  |   test('category cards are clickable', async ({ page }) => {
  58  |     await page.goto('/')
  59  |     const categoryLinks = page.getByRole('link', { name: /devices/i })
  60  |     await expect(categoryLinks.first()).toBeVisible()
  61  |   })
  62  | })
  63  | 
  64  | test.describe('ComparePage', () => {
  65  |   test('loads empty state', async ({ page }) => {
  66  |     await page.goto('/compare')
  67  |     await expect(page.getByRole('heading', { name: /compare/i })).toBeVisible()
  68  |     await expect(page.getByPlaceholder(/search for a device/i)).toBeVisible()
  69  |   })
  70  | })
  71  | 
  72  | test.describe('ChartsPage', () => {
  73  |   test('loads with tabs', async ({ page }) => {
  74  |     await page.goto('/charts')
  75  |     await expect(page.getByRole('heading', { name: /charts/i })).toBeVisible()
  76  |     await expect(page.getByRole('tablist')).toBeVisible()
  77  |   })
  78  | 
  79  |   test('tab switching works', async ({ page }) => {
  80  |     await page.goto('/charts')
  81  |     await page.getByRole('tab', { name: /price vs performance/i }).click()
  82  |     await expect(page.getByRole('tabpanel')).toBeVisible()
  83  |   })
  84  | })
  85  | 
  86  | test.describe('ToolsPage', () => {
  87  |   test('loads TOPS calculator by default', async ({ page }) => {
  88  |     await page.goto('/tools')
  89  |     await expect(page.getByRole('heading', { name: /^tools$/i })).toBeVisible()
  90  |     await expect(page.getByLabel('Tensor Cores')).toBeVisible()
  91  |   })
  92  | 
  93  |   test('tab switching works', async ({ page }) => {
  94  |     await page.goto('/tools')
  95  |     await page.getByRole('tab', { name: /efficiency calculator/i }).click()
  96  |     await expect(page.getByLabel('INT8 TOPS')).toBeVisible()
  97  |   })
  98  | })
  99  | 
  100 | test.describe('ReportsPage', () => {
  101 |   test('loads with report tabs', async ({ page }) => {
  102 |     await page.goto('/reports')
  103 |     await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible()
  104 |     await expect(page.getByRole('tablist')).toBeVisible()
  105 |   })
  106 | })
  107 | 
  108 | test.describe('DocsPage', () => {
  109 |   test('loads API documentation', async ({ page }) => {
  110 |     await page.goto('/docs')
  111 |     await expect(page.getByRole('heading', { name: /api documentation/i })).toBeVisible()
  112 |   })
  113 | 
```