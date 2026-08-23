# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: browse.spec.ts >> BrowsePage >> category filters work
- Location: e2e/browse.spec.ts:19:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "true"
Received: Promise {}
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
        - status [ref=e33]: 181 devices found
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
          - button "GPU" [active] [pressed] [ref=e53]
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
          - button "Clear all filters" [ref=e92]
          - generic [ref=e93]:
            - button "Export CSV" [ref=e94]: CSV
            - button "Export JSON" [ref=e95]: JSON
      - generic [ref=e96]:
        - table "Device list" [ref=e98]:
          - rowgroup [ref=e99]:
            - row [ref=e100]:
              - columnheader "Device ↕" [ref=e101] [cursor=pointer]:
                - generic [ref=e102]:
                  - text: Device
                  - generic [ref=e103]: ↕
              - columnheader "Launch ↓" [ref=e104] [cursor=pointer]:
                - generic [ref=e105]:
                  - text: Launch
                  - generic [ref=e106]: ↓
              - columnheader "RAM ↕" [ref=e107] [cursor=pointer]:
                - generic [ref=e108]:
                  - text: RAM
                  - generic [ref=e109]: ↕
              - columnheader "RAM/$ ↕" [ref=e110] [cursor=pointer]:
                - generic [ref=e111]:
                  - text: RAM/$
                  - generic [ref=e112]: ↕
              - columnheader "INT8 TOPS ↕" [ref=e113] [cursor=pointer]:
                - generic [ref=e114]:
                  - text: INT8 TOPS
                  - generic [ref=e115]: ↕
              - columnheader "TOPS/$ ↕" [ref=e116] [cursor=pointer]:
                - generic [ref=e117]:
                  - text: TOPS/$
                  - generic [ref=e118]: ↕
              - columnheader "TOPS/W ↕" [ref=e119] [cursor=pointer]:
                - generic [ref=e120]:
                  - text: TOPS/W
                  - generic [ref=e121]: ↕
              - columnheader "Perf/$ ↕" [ref=e122] [cursor=pointer]:
                - generic [ref=e123]:
                  - text: Perf/$
                  - generic [ref=e124]: ↕
              - columnheader "TDP ↕" [ref=e125] [cursor=pointer]:
                - generic [ref=e126]:
                  - text: TDP
                  - generic [ref=e127]: ↕
              - columnheader "Price ↕" [ref=e128] [cursor=pointer]:
                - generic [ref=e129]:
                  - text: Price
                  - generic [ref=e130]: ↕
              - columnheader "Data ↕" [ref=e131] [cursor=pointer]:
                - generic [ref=e132]:
                  - text: Data
                  - generic [ref=e133]: ↕
          - rowgroup [ref=e134]:
            - row [ref=e135]:
              - cell [ref=e136]:
                - link "NVIDIA GeForce RTX 5060 Ti 16 GB" [ref=e137] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5060-ti-16gb
              - cell "2025-07" [ref=e138]
              - cell "16 GB" [ref=e139]
              - cell "0.04" [ref=e140]
              - cell "-" [ref=e141]
              - cell "-" [ref=e142]
              - cell "-" [ref=e143]
              - cell "0" [ref=e144]
              - cell "180W" [ref=e145]
              - cell "$449" [ref=e146]
              - cell "47%" [ref=e147]
            - row [ref=e152]:
              - cell [ref=e153]:
                - link "NVIDIA GeForce RTX 5060 Ti 8 GB" [ref=e154] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5060-ti-8gb
              - cell "2025-07" [ref=e155]
              - cell "8 GB" [ref=e156]
              - cell "0.02" [ref=e157]
              - cell "168.45" [ref=e158]
              - cell "0.42" [ref=e159]
              - cell "0.94" [ref=e160]
              - cell "0" [ref=e161]
              - cell "180W" [ref=e162]
              - cell "$399" [ref=e163]
              - cell "53%" [ref=e164]
            - row [ref=e169]:
              - cell [ref=e170]:
                - link "NVIDIA GeForce RTX 5060" [ref=e171] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5060
              - cell "2025-07" [ref=e172]
              - cell "8 GB" [ref=e173]
              - cell "0.03" [ref=e174]
              - cell "-" [ref=e175]
              - cell "-" [ref=e176]
              - cell "-" [ref=e177]
              - cell "0" [ref=e178]
              - cell "150W" [ref=e179]
              - cell "$299" [ref=e180]
              - cell "47%" [ref=e181]
            - row [ref=e186]:
              - cell [ref=e187]:
                - link "NVIDIA GeForce RTX 5050" [ref=e188] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5050
              - cell "2025-07" [ref=e189]
              - cell "8 GB" [ref=e190]
              - cell "0.03" [ref=e191]
              - cell "112.91" [ref=e192]
              - cell "0.45" [ref=e193]
              - cell "0.75" [ref=e194]
              - cell "0" [ref=e195]
              - cell "150W" [ref=e196]
              - cell "$249" [ref=e197]
              - cell "53%" [ref=e198]
            - row [ref=e203]:
              - cell [ref=e204]:
                - link "NVIDIA RTX PRO 6000 Blackwell" [ref=e205] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-pro-6000-blackwell
              - cell "2025-07" [ref=e206]
              - cell "48 GB" [ref=e207]
              - cell "0.01" [ref=e208]
              - cell "-" [ref=e209]
              - cell "-" [ref=e210]
              - cell "-" [ref=e211]
              - cell "0" [ref=e212]
              - cell "350W" [ref=e213]
              - cell "$5,500" [ref=e214]
              - cell "47%" [ref=e215]
            - row [ref=e220]:
              - cell [ref=e221]:
                - link "AMD Radeon RX 9060 XT 16 GB" [ref=e222] [cursor=pointer]:
                  - /url: /device/amd-rx-9060-xt-16gb
              - cell "2025-07" [ref=e223]
              - cell "16 GB" [ref=e224]
              - cell "0.04" [ref=e225]
              - cell "112.91" [ref=e226]
              - cell "0.31" [ref=e227]
              - cell "0.63" [ref=e228]
              - cell "0" [ref=e229]
              - cell "180W" [ref=e230]
              - cell "$359" [ref=e231]
              - cell "53%" [ref=e232]
            - row [ref=e237]:
              - cell [ref=e238]:
                - link "AMD Radeon RX 9060 XT 8 GB" [ref=e239] [cursor=pointer]:
                  - /url: /device/amd-rx-9060-xt-8gb
              - cell "2025-07" [ref=e240]
              - cell "8 GB" [ref=e241]
              - cell "0.03" [ref=e242]
              - cell "112.91" [ref=e243]
              - cell "0.38" [ref=e244]
              - cell "0.63" [ref=e245]
              - cell "0" [ref=e246]
              - cell "180W" [ref=e247]
              - cell "$299" [ref=e248]
              - cell "53%" [ref=e249]
            - row [ref=e254]:
              - cell [ref=e255]:
                - link "NVIDIA B200 192GB" [ref=e256] [cursor=pointer]:
                  - /url: /device/nvidia-b200
              - cell "2025-06-01" [ref=e257]
              - cell "192 GB" [ref=e258]
              - cell "0.00" [ref=e259]
              - cell "918" [ref=e260]
              - cell "0.02" [ref=e261]
              - cell "0.92" [ref=e262]
              - cell "0" [ref=e263]
              - cell "1000W" [ref=e264]
              - cell "$40,000" [ref=e265]
              - cell "53%" [ref=e266]
            - row [ref=e271]:
              - cell [ref=e272]:
                - link "NVIDIA GeForce RTX 5070 Ti" [ref=e273] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5070-ti
              - cell "2025-03-20" [ref=e274]
              - cell "16 GB" [ref=e275]
              - cell "0.02" [ref=e276]
              - cell "1.13k" [ref=e277]
              - cell "1.50" [ref=e278]
              - cell "3.75" [ref=e279]
              - cell "0" [ref=e280]
              - cell "300W" [ref=e281]
              - cell "$749" [ref=e282]
              - cell "60%" [ref=e283]
            - row [ref=e288]:
              - cell [ref=e289]:
                - link "NVIDIA GeForce RTX 5070" [ref=e290] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5070
              - cell "2025-03-20" [ref=e291]
              - cell "12 GB" [ref=e292]
              - cell "0.02" [ref=e293]
              - cell "771" [ref=e294]
              - cell "1.40" [ref=e295]
              - cell "3.08" [ref=e296]
              - cell "0" [ref=e297]
              - cell "250W" [ref=e298]
              - cell "$549" [ref=e299]
              - cell "60%" [ref=e300]
            - row [ref=e305]:
              - cell [ref=e306]:
                - link "AMD Radeon RX 9070 XT" [ref=e307] [cursor=pointer]:
                  - /url: /device/amd-rx-9070-xt
              - cell "2025-03-12" [ref=e308]
              - cell "16 GB" [ref=e309]
              - cell "0.03" [ref=e310]
              - cell "28" [ref=e311]
              - cell "0.05" [ref=e312]
              - cell "0.09" [ref=e313]
              - cell "0" [ref=e314]
              - cell "300W" [ref=e315]
              - cell "$549" [ref=e316]
              - cell "53%" [ref=e317]
            - row [ref=e322]:
              - cell [ref=e323]:
                - link "AMD Radeon RX 9070" [ref=e324] [cursor=pointer]:
                  - /url: /device/amd-rx-9070
              - cell "2025-03-12" [ref=e325]
              - cell "16 GB" [ref=e326]
              - cell "0.04" [ref=e327]
              - cell "-" [ref=e328]
              - cell "-" [ref=e329]
              - cell "-" [ref=e330]
              - cell "0" [ref=e331]
              - cell "250W" [ref=e332]
              - cell "$449" [ref=e333]
              - cell "47%" [ref=e334]
            - row [ref=e339]:
              - cell [ref=e340]:
                - link "NVIDIA GeForce RTX 5090" [ref=e341] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5090
              - cell "2025-01-30" [ref=e342]
              - cell "32 GB" [ref=e343]
              - cell "0.02" [ref=e344]
              - cell "769.28" [ref=e345]
              - cell "0.38" [ref=e346]
              - cell "1.34" [ref=e347]
              - cell "0" [ref=e348]
              - cell "575W" [ref=e349]
              - cell "$1,999" [ref=e350]
              - cell "60%" [ref=e351]
            - row [ref=e356]:
              - cell [ref=e357]:
                - link "NVIDIA GeForce RTX 5080" [ref=e358] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-5080
              - cell "2025-01-30" [ref=e359]
              - cell "16 GB" [ref=e360]
              - cell "0.02" [ref=e361]
              - cell "901" [ref=e362]
              - cell "0.90" [ref=e363]
              - cell "2.50" [ref=e364]
              - cell "0" [ref=e365]
              - cell "360W" [ref=e366]
              - cell "$999" [ref=e367]
              - cell "47%" [ref=e368]
            - row [ref=e373]:
              - cell [ref=e374]:
                - link "NVIDIA B200 192GB" [ref=e375] [cursor=pointer]:
                  - /url: /device/nvidia-b200-192gb
              - cell "2025-01" [ref=e376]
              - cell "192 GB" [ref=e377]
              - cell "0.00" [ref=e378]
              - cell "-" [ref=e379]
              - cell "-" [ref=e380]
              - cell "-" [ref=e381]
              - cell "0" [ref=e382]
              - cell "1000W" [ref=e383]
              - cell "$40,000" [ref=e384]
              - cell "27%" [ref=e385]
            - row [ref=e390]:
              - cell [ref=e391]:
                - link "Intel Arc B580" [ref=e392] [cursor=pointer]:
                  - /url: /device/intel-arc-b580
              - cell "2024-12-13" [ref=e393]
              - cell "12 GB" [ref=e394]
              - cell "0.05" [ref=e395]
              - cell "91.80" [ref=e396]
              - cell "0.37" [ref=e397]
              - cell "0.61" [ref=e398]
              - cell "0" [ref=e399]
              - cell "150W" [ref=e400]
              - cell "$249" [ref=e401]
              - cell "47%" [ref=e402]
            - row [ref=e407]:
              - cell [ref=e408]:
                - link "Intel Arc B570" [ref=e409] [cursor=pointer]:
                  - /url: /device/intel-arc-b570
              - cell "2024-12-12" [ref=e410]
              - cell "12 GB" [ref=e411]
              - cell "0.05" [ref=e412]
              - cell "83.54" [ref=e413]
              - cell "0.33" [ref=e414]
              - cell "0.56" [ref=e415]
              - cell "0" [ref=e416]
              - cell "150W" [ref=e417]
              - cell "$254" [ref=e418]
              - cell "53%" [ref=e419]
            - row [ref=e424]:
              - cell [ref=e425]:
                - link "AMD Instinct MI325X 288GB" [ref=e426] [cursor=pointer]:
                  - /url: /device/amd-mi325x
              - cell "2024-12-10" [ref=e427]
              - cell "288 GB" [ref=e428]
              - cell "0.02" [ref=e429]
              - cell "880.36" [ref=e430]
              - cell "0.06" [ref=e431]
              - cell "0.88" [ref=e432]
              - cell "0" [ref=e433]
              - cell "1000W" [ref=e434]
              - cell "$15,500" [ref=e435]
              - cell "53%" [ref=e436]
            - row [ref=e441]:
              - cell [ref=e442]:
                - link "Intel Arc B580 12GB" [ref=e443] [cursor=pointer]:
                  - /url: /device/intel-arc-b580-12gb
              - cell "2024-12" [ref=e444]
              - cell "12 GB" [ref=e445]
              - cell "0.05" [ref=e446]
              - cell "-" [ref=e447]
              - cell "-" [ref=e448]
              - cell "-" [ref=e449]
              - cell "0" [ref=e450]
              - cell "150W" [ref=e451]
              - cell "$249" [ref=e452]
              - cell "27%" [ref=e453]
            - row [ref=e458]:
              - cell [ref=e459]:
                - link "AMD Radeon RX 7900 GRE" [ref=e460] [cursor=pointer]:
                  - /url: /device/amd-rx-7900-gre
              - cell "2024-08-24" [ref=e461]
              - cell "16 GB" [ref=e462]
              - cell "0.03" [ref=e463]
              - cell "-" [ref=e464]
              - cell "-" [ref=e465]
              - cell "-" [ref=e466]
              - cell "0" [ref=e467]
              - cell "260W" [ref=e468]
              - cell "$549" [ref=e469]
              - cell "47%" [ref=e470]
            - row [ref=e475]:
              - cell [ref=e476]:
                - link "NVIDIA GeForce RTX 4070 Ti Super" [ref=e477] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-4070-ti
              - cell "2024-03-20" [ref=e478]
              - cell "16 GB" [ref=e479]
              - cell "0.02" [ref=e480]
              - cell "162.95" [ref=e481]
              - cell "0.20" [ref=e482]
              - cell "0.57" [ref=e483]
              - cell "0" [ref=e484]
              - cell "285W" [ref=e485]
              - cell "$799" [ref=e486]
              - cell "53%" [ref=e487]
            - row [ref=e492]:
              - cell [ref=e493]:
                - link "NVIDIA GeForce RTX 4080 Super" [ref=e494] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-4080-super
              - cell "2024-01-31" [ref=e495]
              - cell "16 GB" [ref=e496]
              - cell "0.02" [ref=e497]
              - cell "190.94" [ref=e498]
              - cell "0.19" [ref=e499]
              - cell "0.60" [ref=e500]
              - cell "0" [ref=e501]
              - cell "320W" [ref=e502]
              - cell "$999" [ref=e503]
              - cell "53%" [ref=e504]
            - row [ref=e509]:
              - cell [ref=e510]:
                - link "AMD Radeon RX 7600 XT" [ref=e511] [cursor=pointer]:
                  - /url: /device/amd-rx-7600-xt
              - cell "2024-01-24" [ref=e512]
              - cell "16 GB" [ref=e513]
              - cell "0.05" [ref=e514]
              - cell "56.46" [ref=e515]
              - cell "0.17" [ref=e516]
              - cell "0.38" [ref=e517]
              - cell "0" [ref=e518]
              - cell "150W" [ref=e519]
              - cell "$329" [ref=e520]
              - cell "53%" [ref=e521]
            - row [ref=e526]:
              - cell [ref=e527]:
                - link "NVIDIA GeForce RTX 4070 Super" [ref=e528] [cursor=pointer]:
                  - /url: /device/nvidia-rtx-4070-super
              - cell "2024-01-17" [ref=e529]
              - cell "12 GB" [ref=e530]
              - cell "0.02" [ref=e531]
              - cell "533" [ref=e532]
              - cell "0.89" [ref=e533]
              - cell "2.42" [ref=e534]
              - cell "0" [ref=e535]
              - cell "220W" [ref=e536]
              - cell "$599" [ref=e537]
              - cell "60%" [ref=e538]
            - row [ref=e543]:
              - cell [ref=e544]:
                - link "NVIDIA H200 141GB SXM" [ref=e545] [cursor=pointer]:
                  - /url: /device/nvidia-h200-sxm
              - cell "2024-01-15" [ref=e546]
              - cell "141 GB" [ref=e547]
              - cell "0.00" [ref=e548]
              - cell "908.36" [ref=e549]
              - cell "0.03" [ref=e550]
              - cell "1.30" [ref=e551]
              - cell "0" [ref=e552]
              - cell "700W" [ref=e553]
              - cell "$30,000" [ref=e554]
              - cell "53%" [ref=e555]
        - generic [ref=e560]:
          - generic [ref=e561]: Showing 1-25 of 181
          - generic [ref=e562]:
            - button "Previous page" [disabled] [ref=e563]: Previous
            - button "Page 1" [ref=e564]: "1"
            - button "Page 2" [ref=e565]: "2"
            - button "Page 3" [ref=e566]: "3"
            - button "Page 4" [ref=e567]: "4"
            - button "Page 5" [ref=e568]: "5"
            - button "Next page" [ref=e569]: Next
  - contentinfo "Site footer" [ref=e570]:
    - generic [ref=e571]:
      - generic [ref=e572]:
        - generic [ref=e573]:
          - generic [ref=e574]: SiliconRank
          - paragraph [ref=e576]: Open hardware intelligence platform. Compare CPUs, GPUs, NPUs, and AI accelerators.
        - generic [ref=e577]:
          - heading "Explore" [level=4] [ref=e578]
          - generic [ref=e579]:
            - link "Browse Devices" [ref=e580] [cursor=pointer]:
              - /url: /browse
            - link "Compare" [ref=e581] [cursor=pointer]:
              - /url: /compare
            - link "Charts" [ref=e582] [cursor=pointer]:
              - /url: /charts
            - link "Studio" [ref=e583] [cursor=pointer]:
              - /url: /studio
            - link "Tools" [ref=e584] [cursor=pointer]:
              - /url: /tools
            - link "Reports" [ref=e585] [cursor=pointer]:
              - /url: /reports
            - link "API Docs" [ref=e586] [cursor=pointer]:
              - /url: /docs
        - generic [ref=e587]:
          - heading "Categories" [level=4] [ref=e588]
          - generic [ref=e589]:
            - link "CPUs" [ref=e590] [cursor=pointer]:
              - /url: /browse?category=CPU
            - link "GPUs" [ref=e591] [cursor=pointer]:
              - /url: /browse?category=GPU
            - link "NPUs / AI" [ref=e592] [cursor=pointer]:
              - /url: /browse?category=NPU
            - link "SBCs" [ref=e593] [cursor=pointer]:
              - /url: /browse?category=SBC
            - link "Memory" [ref=e594] [cursor=pointer]:
              - /url: /browse?category=Memory
            - link "Storage" [ref=e595] [cursor=pointer]:
              - /url: /browse?category=Storage
        - generic [ref=e596]:
          - heading "Project" [level=4] [ref=e597]
          - generic [ref=e598]:
            - link "GitHub" [ref=e599] [cursor=pointer]:
              - /url: https://github.com/aliasfoxkde/HardwareSpecs
            - generic [ref=e602]: Open Source (MIT)
            - generic [ref=e603]: 304 devices · 35 vendors
      - generic [ref=e605]:
        - generic [ref=e606]: SiliconRank © 2026 · Open source under MIT License
        - generic [ref=e607]:
          - link "Sponsor" [ref=e608] [cursor=pointer]:
            - /url: https://github.com/sponsors/aliasfoxkde
          - link "Ko-fi" [ref=e611] [cursor=pointer]:
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
  13  |     await searchInput.fill('NVIDIA')
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
> 24  |     await expect(gpuButton.getAttribute('aria-pressed')).toBe('true')
      |                                                          ^ Error: expect(received).toBe(expected) // Object.is equality
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
  114 |   test('endpoint list is visible', async ({ page }) => {
  115 |     await page.goto('/docs')
  116 |     await expect(page.getByText('getVendors')).toBeVisible()
  117 |   })
  118 | })
  119 | 
```