alert("script geladen");
console.log("script gestartet");

const supabaseUrl =
    "https://wosxlwsnkssergfvbzla.supabase.co";

const supabaseKey =
    "sb_publishable_6tO_oqxyRqx241aeypFqTw_JArFTo3-";

const supabaseClient =
    window.supabase.createClient(
        supabaseUrl,
        supabaseKey
    );

const bestaende = [];
let aktuellerStandort = "";

async function loadBestaende() {

    const { data, error } =
        await supabaseClient
            .from("KabinenBestand")
            .select("*");

    console.log("ROH:", data);

    if (error) {

        console.error("LOAD ERROR:", error);
        return;

    }

    bestaende.length = 0;

    data.forEach(e => {

        bestaende.push({
            standort: e.standort,
            kw: String(e.kw),
            kabinentyp: e.kabinentyp,
            bestand: e.bestand
        });

    });

    window.bestaendeBackup = [...bestaende];

    console.log(
        "BESTAENDE GELADEN:",
        bestaende
    );



}

document.addEventListener("DOMContentLoaded", () => {

    const mapObject =
        document.getElementById("austriaMap");

    const standortSelect =
        document.getElementById("standort");

    const kwSelect =
        document.getElementById("kw");

    const anzeigeKW =
        document.getElementById("anzeigeKW");

    const typSelect =
        document.getElementById("typ");

    const saveBtn =
        document.getElementById("saveBtn");

    const kabinentypen = [
        "Toi Water",
        "Toi Water up",
        "Toi Fresh",
        "Toi Flush",
        "Toi Green",
        "Dixi Green",
        "Toi Cap",
        "Toi Nature",
        "Toi Mini",
        "Toi Rolluri",
        "Toi Quattro",
        "Boels",
        "Toi Plus",
        "Toi Plus Wash",
        "Toi Hygiene Plus",
        "Dawi Baustelle",
        "Dawi Event",
        "Mobiclo up",
        "Mobiclo Green",
        "Dufti",
        "Classic",
        "Boxi",
        "Oriental",
        "Tank 800l",
        "Desinfekt",
        "Dixi Blue"
    ];

    const standortZuBundeslaender = {
        liesing: ["wien", "burgenland"],
        raasdorf: ["niederoesterreich"],
        wels: ["oberoesterreich"],
        spittal: ["kaernten"],
        graz: ["steiermark"],
        hall: ["tirol"]
    };

    // KW Listen

    for (let i = 1; i <= 52; i++) {

        const option1 =
            document.createElement("option");

        option1.value = i;
        option1.textContent =
            "KW " + i;

        kwSelect.appendChild(option1);

        const option2 =
            document.createElement("option");

        option2.value = i;
        option2.textContent =
            "KW " + i;

        anzeigeKW.appendChild(option2);

    }

    // Typen

    kabinentypen.forEach(typ => {

        const option =
            document.createElement("option");

        option.value = typ;
        option.textContent = typ;

        typSelect.appendChild(option);

    });

    function aktualisiereAnzeige() {

        const gesamtContainer =
            document.getElementById(
                "gesamtBestandContainer"
            );

        const standortContainer =
            document.getElementById(
                "standortBestandContainer"
            );

        gesamtContainer.innerHTML = "";
        standortContainer.innerHTML = "";

        const gesamt = {};
        const standort = {};

        kabinentypen.forEach(typ => {

            gesamt[typ] = 0;
            standort[typ] = 0;

        });

        bestaende.forEach(e => {

            if (
                e.kw ==
                anzeigeKW.value
            ) {

                gesamt[
                    e.kabinentyp
                ] += e.bestand;

            }

            if (
                e.standort ===
                    aktuellerStandort &&
                e.kw ==
                    anzeigeKW.value
            ) {

                standort[
                    e.kabinentyp
                ] += e.bestand;

            }

        });

        kabinentypen.forEach(typ => {

            if (gesamt[typ] > 0) {

                gesamtContainer.innerHTML += `
                    <div class="bestand-zeile">
                        <span>${typ}</span>
                        <span>${gesamt[typ]}</span>
                    </div>
                `;

            }

            if (standort[typ] > 0) {

                standortContainer.innerHTML += `
                    <div class="bestand-zeile">
                        <span>${typ}</span>
                        <span>${standort[typ]}</span>
                    </div>
                `;

            }

        });

        document.getElementById(
            "standortTitel"
        ).textContent =
            aktuellerStandort
                ? `Standortbestand - ${
                    aktuellerStandort
                  }`
                : "Standortbestand";

    }

    // Speichern

    saveBtn.addEventListener(
        "click",
        async () => {

            const datensatz = {
                standort:
                    standortSelect.value,
                kw: Number(
                    kwSelect.value
                ),
                kabinentyp:
                    typSelect.value,
                bestand: Number(
                    document
                        .getElementById(
                            "anzahl"
                        )
                        .value
                )
            };

            console.log(
                "SENDE:",
                datensatz
            );

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "KabinenBestand"
                    )
                    .upsert(
                        [datensatz],
                        {
                            onConflict:
                                "standort,kw,kabinentyp"
                        }
                    )
                    .select();

            console.log(
                "DATA:",
                data
            );

            console.log(
                "ERROR:",
                error
            );

            if (error) {

                alert(
                    JSON.stringify(
                        error,
                        null,
                        2
                    )
                );

                return;

            }

            await loadBestaende();

            alert(
                "Datensatz gespeichert"
            );

        }
    );

    // KW Filter

    anzeigeKW.addEventListener(
        "change",
        () => { });

    // SVG

    mapObject.addEventListener(
        "load",
        () => {

            console.log(
                "SVG geladen"
            );

            const svgDoc =
                mapObject.contentDocument;

            const bundeslaender =
                [
                    "wien",
                    "niederoesterreich",
                    "oberoesterreich",
                    "burgenland",
                    "steiermark",
                    "kaernten",
                    "salzburg",
                    "tirol",
                    "vorarlberg"
                ];

            function resetMap() {

                bundeslaender.forEach(
                    id => {

                        const land =
                            svgDoc.getElementById(
                                id
                            );

                        if (land) {

                            land.style.fill =
                                "#B1D1A3";

                        }

                    }
                );

            }

            const standortButtons =
                document.querySelectorAll(
                    ".standort-btn"
                );

            standortButtons.forEach(
                btn => {

                    btn.addEventListener(
                        "click",
                        () => {

                            document
                                .querySelectorAll(
                                    ".standort-btn"
                                )
                                .forEach(
                                    b =>
                                        b.classList.remove(
                                            "aktiv"
                                        )
                                );

                            btn.classList.add(
                                "aktiv"
                            );

                            aktuellerStandort =
                                btn.dataset.standort;

                            resetMap();

                            const laender =
                                standortZuBundeslaender[
                                    aktuellerStandort
                                ];

                            if (laender) {

                                laender.forEach(
                                    id => {

                                        const land =
                                            svgDoc.getElementById(
                                                id
                                            );

                                        if (land) {

                                            land.style.fill =
                                                "#0078d4";

                                        }

                                    }
                                );

                            }
                            }

                            aktualisiereAnzeige();

                        });

                    });

            resetMap();

        });

    loadBestaende();

});
  



