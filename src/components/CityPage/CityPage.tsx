import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./CityPage.css";
import JudgeInCity from "../JudgeInCity/JudgeInCity.tsx";
import judgeData from "../../data/judge_grant_rates.json";
import DonutChart from "../DonutChart/DonutChart.tsx";
import Tooltip from "../Tooltip/Tooltip.tsx";
import DropdownMenu from "../DropdownMenu/DropdownMenu.tsx";
import { useEffect } from "react";

interface Judge {
    city: string;
    judge_name: string;
    denied_percentage: string;
    granted_asylum_percentage: string;
    granted_other_relief_percentage: string;
    total_decisions: number;
}

interface CityPageProps {
    currentLanguage: string;
}

const cityImages: Record<string, string> = {
    "San Francisco": require("../../assets/SanFrancisco.png"),
    "New York": require("../../assets/NewYork.png"),
  };
  
const parsePercentage = (value: string | number | undefined): number => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[^0-9.]/g, "")) || 0;
};

/** Step 1: Define a single set of sort "values" and map them to labels (EN + ES). */
const SORT_OPTIONS = [
    {
        value: "approvalHigh",
        en: "Approval Rate (High to Low)",
        es: "Tasa de Aprobación (Alta a Baja)",
        ht: "To Apwobasyon (Wo a Ba)",
    },
    {
        value: "approvalLow",
        en: "Approval Rate (Low to High)",
        es: "Tasa de Aprobación (Baja a Alta)",
        ht: "To Apwobasyon (Ba a Wo)",
    },
    {
        value: "casesHigh",
        en: "Amount of Cases (High to Low)",
        es: "Cantidad de Casos (Alta a Baja)",
        ht: "Kantite Ka (Wo a Ba)",
    },
    {
        value: "casesLow",
        en: "Amount of Cases (Low to High)",
        es: "Cantidad de Casos (Baja a Alta)",
        ht: "Kantite Ka (Ba a Wo)",
    },
    {
        value: "alpha",
        en: "Alphabetical",
        es: "Alfabético",
        ht: "Alfabètik",
    },
];

function CityPage({ currentLanguage }: CityPageProps) {
    const params = useParams<{ cityName: string }>();
    const city = params.cityName || "San Francisco";
    const bg = cityImages[city] || cityImages["San Francisco"];
        const cityJudgesObj = judgeData[city || ""] || {};
    const cityJudges: Judge[] = Object.values(cityJudgesObj).map((judge) => ({
        ...judge,
        granted_asylum_percentage: parsePercentage(
            judge.granted_asylum_percentage
        ),
        total_decisions: Number(judge.total_decisions),
    }));

    useEffect(() => {
        window.scrollTo(0, 0);
      }, [city]);
    
    
    /** Step 2: Store the internal "value" (e.g. "approvalHigh"), not the displayed text. */
    const [sortValue, setSortValue] = useState<string>("approvalHigh");

    /** Step 3: Switch on the "value" rather than the displayed text. */
    const sortJudges = (judges: Judge[], sortValue: string): Judge[] => {
        switch (sortValue) {
            case "approvalHigh":
                return [...judges].sort(
                    (a, b) =>
                        b.granted_asylum_percentage -
                        a.granted_asylum_percentage
                );
            case "approvalLow":
                return [...judges].sort(
                    (a, b) =>
                        a.granted_asylum_percentage -
                        b.granted_asylum_percentage
                );
            case "casesHigh":
                return [...judges].sort(
                    (a, b) => b.total_decisions - a.total_decisions
                );
            case "casesLow":
                return [...judges].sort(
                    (a, b) => a.total_decisions - b.total_decisions
                );
            case "alpha":
                return [...judges].sort((a, b) =>
                    a.judge_name.localeCompare(b.judge_name)
                );
            default:
                return judges;
        }
    };

    const sortedJudges = sortJudges(cityJudges, sortValue);

    /** Step 4: Build the dropdown options based on currentLanguage. 
      Each item: { label: string, value: string } */
    const dropdownOptions = SORT_OPTIONS.map((opt) => ({
        value: opt.value,
        label:
            currentLanguage === "en"
                ? opt.en
                : currentLanguage === "es"
                ? opt.es
                : opt.ht,
    }));

    const sortByLabel =
        currentLanguage === "en"
            ? "Sort by"
            : currentLanguage === "es"
            ? "Ordenar por"
            : "Triye pa";

    const averageRatesLabel =
        currentLanguage === "en"
            ? "Average Rates"
            : currentLanguage === "es"
            ? "Tasas Promedio"
            : "To Mwayèn";

    const cityStatsLabel =
        currentLanguage === "en"
            ? "City Stats"
            : currentLanguage === "es"
            ? "Estadísticas de la Ciudad"
            : "Estatistik Vil";

    let casesAmount: number = 0;
    for (let judge of cityJudges) {
        casesAmount += Number(judge.total_decisions);
    }

    const asylumRates = cityJudges.map((j) =>
        parsePercentage(j.granted_asylum_percentage)
    );
    const otherRates = cityJudges.map((j) =>
        parsePercentage(j.granted_other_relief_percentage)
    );
    const deniedPercentage = cityJudges.map((j) =>
        parsePercentage(j.denied_percentage)
    );

    // Then compute the averages
    const avgAsylumGrantRate: number = asylumRates.length
        ? asylumRates.reduce((acc, val) => acc + val, 0) / asylumRates.length
        : 0;
    const avgOtherGrantRate: number = otherRates.length
        ? otherRates.reduce((acc, val) => acc + val, 0) / otherRates.length
        : 0;
    const avgDeniedRate: number = deniedPercentage.length
        ? deniedPercentage.reduce((acc, val) => acc + val, 0) /
          deniedPercentage.length
        : 0;

    // Then do:
    const asylumGrantedAmount = Math.round(
        (casesAmount * avgAsylumGrantRate) / 100
    );
    const otherGrantedAmount = Math.round(
        (casesAmount * avgOtherGrantRate) / 100
    );
    const deniedAmount = Math.round((casesAmount * avgDeniedRate) / 100);

    const asylumGranted =
        currentLanguage === "en"
            ? "Asylum Granted"
            : currentLanguage === "es"
            ? "Asilo Otorgado"
            : "Azil Akòde";

    const otherRelief =
        currentLanguage === "en"
            ? "Other Relief Granted"
            : currentLanguage === "es"
            ? "Otro Alivio Otorgado"
            : "Lòt Sekou Akòde";

    const denied =
        currentLanguage === "en"
            ? "Cases Denied"
            : currentLanguage === "es"
            ? "Casos Denegados"
            : "Ka Refize";

    const cityLabel =
        currentLanguage === "en"
            ? "City"
            : currentLanguage === "es"
            ? "Ciudad"
            : "Vil";

    const judgeLabel =
        currentLanguage === "en"
            ? "Judges"
            : currentLanguage === "es"
            ? "Jueces"
            : "Jij";

    const outOf =
        currentLanguage === "en"
            ? "Out of"
            : currentLanguage === "es"
            ? "De"
            : "Soti nan";

    const caseIn =
        currentLanguage === "en"
            ? "cases in"
            : currentLanguage === "es"
            ? "casos en"
            : "ka nan";

            const wereGrantedAsylum =
            currentLanguage === "en"
              ? "were granted asylum or other forms of relief."
              : currentLanguage === "es"
              ? "fueron otorgados asilo u otros tipos de alivio."
              : "te resevwa azil oswa lòt fòm sekou.";
          
    const wereGrantedOtherRelief =
        currentLanguage === "en"
            ? "were granted other relief, and "
            : currentLanguage === "es"
            ? "fueron otorgados otro alivio, y "
            : "te resevwa lòt sekou, e ";

    const wereDenied =
        currentLanguage === "en"
            ? "were denied"
            : currentLanguage === "es"
            ? "fueron denegados"
            : "te refize";

    const asylumGrantedInfo =
        currentLanguage === "en"
            ? "This number is the percent of cases in this city where asylum was granted."
            : currentLanguage === "es"
            ? "Este número es el porcentaje de casos en esta ciudad donde se otorgó asilo."
            : "Nimewo sa a se pousantaj ka nan vil sa a kote azil te akòde.";

    const otherReliefInfo =
        currentLanguage === "en"
            ? "This number is the percent of cases in this city where other relief, such as withholding of removal, convention against torture (CAT), or discretionary humanitarian relief was granted."
            : currentLanguage === "es"
            ? "Este número es el porcentaje de casos en esta ciudad donde se otorgó otro tipo de ayuda, como la suspensión de la deportación, la convención contra la tortura (CAT) o la ayuda humanitaria discrecional."
            : "Nimewo sa a se pousantaj ka nan vil sa a kote lòt sekou, tankou retansyon depòtasyon, Konvansyon kont Tòti (CAT), oswa sekou imanitè diskresyonè te akòde.";

    const deniedInfo =
        currentLanguage === "en"
            ? "This number is the percent of cases in this city that were denied, whether asylum or other."
            : currentLanguage === "es"
            ? "Este número es el porcentaje de casos en esta ciudad donde se denegaron, ya sea asilo u otro tipo de alivio."
            : "Nimewo sa a se pousantaj ka nan vil sa a ki te refize, kit se azil oswa lòt sekou.";
    // --- Sidebar labels ---
    const judgesInLabel =
    currentLanguage === "en"
    ? "Judges in"
    : currentLanguage === "es"
    ? "Jueces en"
    : "Jij nan";

    const showJudgesLabel =
    currentLanguage === "en"
    ? "Show Judges"
    : currentLanguage === "es"
    ? "Mostrar Jueces"
    : "Montre Jij yo";

    const hideJudgesLabel =
    currentLanguage === "en"
    ? "Hide Judges"
    : currentLanguage === "es"
    ? "Ocultar Jueces"
    : "Kache Jij yo";

    // --- City stats summary text ---
    const asylumSummaryText =
    currentLanguage === "en"
    ? "were granted asylum."
    : currentLanguage === "es"
    ? "fueron otorgados asilo."
    : "te resevwa azil.";

    const otherReliefSummaryText =
    currentLanguage === "en"
    ? "received other relief."
    : currentLanguage === "es"
    ? "recibieron otro tipo de alivio."
    : "resevwa lòt sekou.";

    const deniedSummaryText =
    currentLanguage === "en"
    ? "were denied asylum or other forms of relief."
    : currentLanguage === "es"
    ? "fueron denegados asilo u otros tipos de alivio."
    : "te refize azil oswa lòt fòm sekou.";

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const nationalAverageNote =
    currentLanguage === "en"
    ? "indicates the U.S. national average rate for comparison."
    : currentLanguage === "es"
    ? "indica la tasa promedio nacional de EE. UU. para comparación."
    : "endike pousantaj mwayèn nasyonal Etazini pou konparezon.";

    return (
        <div
          className={`city-page ${sidebarOpen ? "sidebar-open" : ""}`}
          style={{
            "--bg-image": `url(${bg})`,
          } as React.CSSProperties}
        >
          <div className="city-content">
            {/* ✅ MAIN WRAPPER that centers & shifts */}
            <div className={`main-wrapper ${sidebarOpen ? "shifted" : ""}`}>
              <div className="main-layout">
                {/* LEFT COLUMN */}
                <div className="main-left">
                  {/* --- CITY HEADER + STATS --- */}
                  <div className="header-section">
                    <div className="city-title-description">
                      <h2 className="city-title">{city}</h2>
                      <h1 className="city-descriptor label">{cityLabel}</h1>
                      <h3 className="city-descriptor judge-count">
                        {cityJudges.length} {judgeLabel}
                      </h3>
      
                      {/* ✅ City Stats */}
                      <div className="city-top-stats">
                        <div className="city-stats-box">
                          <p>
                            <span className="asylum-granted">
                              {asylumGrantedAmount + otherGrantedAmount}
                            </span>{" "}
                            {asylumGrantedAmount + otherGrantedAmount === 1
                              ? "case"
                              : "cases"}{" "}
                            {outOf.toLowerCase()}{" "}
                            <span className="cases-amount">{casesAmount}</span> total{" "}
                            {casesAmount === 1 ? "case" : "cases"} {caseIn} {city}{" "}
                            {wereGrantedAsylum}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
      
                  {/* --- AVERAGE RATES --- */}
                  <div className="rates-section">
                    <h2 className="section-header rates">{averageRatesLabel}</h2>
                    <p className="national-average-note">
                        <span className="dash-example">— - — </span> {nationalAverageNote}
                    </p>
                    <div className="donut-charts-container vertical">
                      {/* ASYLUM GRANTED */}
                      <div className="donut-row">
                        <div className="donut-side">
                          <div className="donut-chart-div">
                            <DonutChart
                              title={asylumGranted}
                              percentage={avgAsylumGrantRate}
                              nationalAverage={45}
                              className="asylum-granted-donut-chart"
                              size={180}
                              strokeWidth={20}
                              color="#6CAF5C"
                            />
                          </div>
                          <div className="donut-chart-description">
                            <p>{asylumGranted}</p>
                            <Tooltip text={asylumGrantedInfo}>
                              <span className="info-icon-city">
                                <i className="fas fa-info-circle"></i>
                              </span>
                            </Tooltip>
                          </div>
                        </div>
      
                        {/* ✅ Text summary for Asylum Granted */}
                        <div className="donut-textbox">
                          <p>
                            <span className="asylum-granted">{asylumGrantedAmount}</span>{" "}
                            {asylumGrantedAmount === 1 ? "case" : "cases"}{" "}
                            {outOf.toLowerCase()}{" "}
                            <span className="cases-amount">{casesAmount}</span> total{" "}
                            {casesAmount === 1 ? "case" : "cases"} {caseIn} {city}{" "}
                            {asylumSummaryText}
                          </p>
                        </div>
                      </div>
      
                      {/* OTHER RELIEF GRANTED */}
                      <div className="donut-row">
                        <div className="donut-side">
                          <div className="donut-chart-div">
                            <DonutChart
                              title={otherRelief}
                              percentage={avgOtherGrantRate}
                              nationalAverage={12}
                              className="other-relief-donut-chart"
                              size={180}
                              strokeWidth={20}
                              color="#C5FBA3"
                            />
                          </div>
                          <div className="donut-chart-description">
                            <p>{otherRelief}</p>
                            <Tooltip text={otherReliefInfo}>
                              <span className="info-icon-city">
                                <i className="fas fa-info-circle"></i>
                              </span>
                            </Tooltip>
                          </div>
                        </div>
      
                        {/* ✅ Text summary for Other Relief */}
                        <div className="donut-textbox">
                          <p>
                            <span className="other-granted">{otherGrantedAmount}</span>{" "}
                            {otherGrantedAmount === 1 ? "case" : "cases"}{" "}
                            {outOf.toLowerCase()}{" "}
                            <span className="cases-amount">{casesAmount}</span> total{" "}
                            {casesAmount === 1 ? "case" : "cases"} {caseIn} {city}{" "}
                            {otherReliefSummaryText}
                          </p>
                        </div>
                      </div>
      
                      {/* CASES DENIED */}
                      <div className="donut-row">
                        <div className="donut-side">
                          <div className="donut-chart-div">
                            <DonutChart
                              title={denied}
                              percentage={avgDeniedRate}
                              nationalAverage={43}
                              className="denied-donut-chart"
                              size={180}
                              strokeWidth={20}
                              color="#FF7A7A"
                            />
                          </div>
                          <div className="donut-chart-description">
                            <p>{denied}</p>
                            <Tooltip text={deniedInfo}>
                              <span className="info-icon-city">
                                <i className="fas fa-info-circle"></i>
                              </span>
                            </Tooltip>
                          </div>
                        </div>
      
                        {/* ✅ Text summary for Denied */}
                        <div className="donut-textbox">
                          <p>
                            <span className="denied-amount">{deniedAmount}</span>{" "}
                            {deniedAmount === 1 ? "case" : "cases"}{" "}
                            {outOf.toLowerCase()}{" "}
                            <span className="cases-amount">{casesAmount}</span> total{" "}
                            {casesAmount === 1 ? "case" : "cases"} {caseIn} {city}{" "}
                            {deniedSummaryText}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
            {/* --- SIDEBAR TOGGLE BUTTON (always visible) --- */}
            <button
              className={`sidebar-toggle ${sidebarOpen ? "open" : ""}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <>
                  ➤
                  <span className="sidebar-tooltip">{hideJudgesLabel}</span>
                </>
              ) : (
                <>
                  ◄
                  <span className="sidebar-tooltip">{showJudgesLabel}</span>
                </>
              )}
            </button>
      
            {/* --- SIDEBAR (slides out) --- */}
            <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
              <div className="sidebar-content">
                <h3 className="sidebar-title">
                  {judgesInLabel} {city}
                </h3>
      
                {/* === Sort Dropdown for Sidebar === */}
                <div className="sidebar-sort">
                  <label htmlFor="sidebar-sort-select" className="sidebar-sort-label">
                    {sortByLabel}:
                  </label>
                  <select
                    id="sidebar-sort-select"
                    className="sidebar-sort-select"
                    value={sortValue}
                    onChange={(e) => setSortValue(e.target.value)}
                  >
                    {dropdownOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
      
                <div className="sidebar-list">
                  {sortedJudges.length > 0 &&
                    sortedJudges.map((judge, index) => (
                      <Link
                        to={`/judge/${encodeURIComponent(judge.judge_name)}`}
                        key={judge.judge_name}
                        className="sidebar-judge-link"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div
                          className="sidebar-judge-card"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="sidebar-judge-row">
                            <div className="sidebar-judge-left">
                              <span className="sidebar-judge-name">
                                {judge.judge_name}
                              </span>
                              <span className="sidebar-judge-cases">
                                {judge.total_decisions} cases
                              </span>
                            </div>
      
                            {/* ✅ Tiny donut on the far right */}
                            <div className="sidebar-mini-donut">
                              <DonutChart
                                key={`${judge.judge_name}-${sidebarOpen}`}
                                title=" "
                                percentage={Number(
                                  parsePercentage(judge.granted_asylum_percentage)
                                )}
                                size={50}
                                strokeWidth={5}
                                animate={sidebarOpen}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
                                }
                                export default CityPage;