import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./JudgePage.css";
import judgeData from "../../data/judge_grant_rates.json";
import DonutChart from "../DonutChart/DonutChart.tsx";
import Tooltip from "../Tooltip/Tooltip.tsx";

interface SingleJudge {
    city: string;
    judge_name: string;
    denied_percentage: string | number;
    granted_asylum_percentage: string | number;
    granted_other_relief_percentage: string | number;
    total_decisions: number;
}

interface JudgePageProps {
    currentLanguage: string;
}

const translations = {
    en: {
        judgeNotFound: "Judge not found",
        asylumGranted: "Asylum Granted",
        otherReliefGranted: "Other Relief Granted",
        denied: "Cases Denied",
        averageRates: "Average Rates",
        judgeStats: "Judge Stats",
        judge: "Judge",
        outOf: "Out of",
        casesFor: "cases for",
        wereGrantedAsylum: "were granted asylum.",
        wereGrantedOtherRelief: "received other relief.",
        wereDenied: "were denied asylum or other forms of relief.",
        asylumGrantedInfo:
            "This number is the percent of cases where this judge granted asylum.",
        otherReliefInfo:
            "This number is the percent of cases where this judge granted other relief, such as withholding of removal, convention against torture (CAT), or discretionary humanitarian relief.",
        deniedInfo:
            "This number is the percent of cases this judge denied, whether asylum or other.",
        nationalAverageNote: "indicates the U.S. national average rate for comparison.",
        otherJudgesIn: "Other Judges in",
        showJudges: "Show Other Judges",
        hideJudges: "Hide Other Judges",
        sortBy: "Sort by",
        approvalHigh: "Approval Rate (High to Low)",
        approvalLow: "Approval Rate (Low to High)",
        casesHigh: "Amount of Cases (High to Low)",
        casesLow: "Amount of Cases (Low to High)",
        alpha: "Alphabetical",
    },
    es: {
        judgeNotFound: "Juez no encontrado",
        asylumGranted: "Asilo Otorgado",
        otherReliefGranted: "Otro Alivio Otorgado",
        denied: "Casos Denegados",
        averageRates: "Tasas Promedio",
        judgeStats: "Estadísticas del Juez",
        judge: "Juez",
        outOf: "De",
        casesFor: "casos de",
        wereGrantedAsylum: "fueron otorgados asilo.",
        wereGrantedOtherRelief: "recibieron otro alivio.",
        wereDenied: "fueron denegados asilo u otros tipos de alivio.",
        asylumGrantedInfo:
            "Este número es el porcentaje de casos en los que este juez otorgó asilo.",
        otherReliefInfo:
            "Este número es el porcentaje de casos en los que este juez otorgó otro alivio, como la suspensión de la deportación, convención contra la tortura (CAT) o ayuda humanitaria discrecional.",
        deniedInfo:
            "Este número es el porcentaje de casos en los que este juez denegó, ya sea asilo u otro tipo de alivio.",
        nationalAverageNote: "indica la tasa promedio nacional de EE. UU. para comparación.",
        otherJudgesIn: "Otros Jueces en",
        showJudges: "Mostrar Otros Jueces",
        hideJudges: "Ocultar Otros Jueces",
        sortBy: "Ordenar por",
        approvalHigh: "Tasa de Aprobación (Alta a Baja)",
        approvalLow: "Tasa de Aprobación (Baja a Alta)",
        casesHigh: "Cantidad de Casos (Alta a Baja)",
        casesLow: "Cantidad de Casos (Baja a Alta)",
        alpha: "Alfabético",
    },
    ht: {
        judgeNotFound: "Jij pa jwenn",
        asylumGranted: "Azil Akòde",
        otherReliefGranted: "Lòt Sekou Akòde",
        denied: "Ka Refize",
        averageRates: "To Mwayèn",
        judgeStats: "Estatistik Jij",
        judge: "Jij",
        outOf: "Soti nan",
        casesFor: "ka pou",
        wereGrantedAsylum: "te resevwa azil.",
        wereGrantedOtherRelief: "resevwa lòt sekou.",
        wereDenied: "te refize azil oswa lòt fòm sekou.",
        asylumGrantedInfo:
            "Nimewo sa a se pousantaj ka jij sa a te akòde azil.",
        otherReliefInfo:
            "Nimewo sa a se pousantaj ka jij sa a te akòde lòt sekou, tankou retansyon depòtasyon, Konvansyon kont Tòti (CAT), oswa sekou imanitè diskresyonè.",
        deniedInfo:
            "Nimewo sa a se pousantaj ka jij sa a te refize, kit se azil oswa lòt sekou.",
        nationalAverageNote: "endike pousantaj mwayèn nasyonal Etazini pou konparezon.",
        otherJudgesIn: "Lòt Jij nan",
        showJudges: "Montre Lòt Jij yo",
        hideJudges: "Kache Lòt Jij yo",
        sortBy: "Triye pa",
        approvalHigh: "To Apwobasyon (Wo a Ba)",
        approvalLow: "To Apwobasyon (Ba a Wo)",
        casesHigh: "Kantite Ka (Wo a Ba)",
        casesLow: "Kantite Ka (Ba a Wo)",
        alpha: "Alfabètik",
    },
};

const SORT_OPTIONS = [
    { value: "approvalHigh" },
    { value: "approvalLow" },
    { value: "casesHigh" },
    { value: "casesLow" },
    { value: "alpha" },
];

// City images mapping
const cityImages: Record<string, string> = {
    "San Francisco": require("../../assets/SanFrancisco.png"),
    "New York": require("../../assets/NewYork.png"),
    "Hyattsville": require("../../assets/Hyattsville.png"),
    "Honolulu": require("../../assets/Honolulu.png"),
    "Imperial": require("../../assets/Imperial.png"),
    "Baltimore": require("../../assets/Baltimore.png"),
    "Chicago": require("../../assets/Chicago.png"),
    "Sacramento": require("../../assets/Sacramento.png"),
};

// gradient background as default
const defaultBg = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";

const parsePercentage = (value: string | number | undefined): number => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[^0-9.]/g, "")) || 0;
};

function JudgePage({ currentLanguage }: JudgePageProps) {
    const params = useParams<{ judgeName: string }>();
    const judgeNameParam = params.judgeName;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sortValue, setSortValue] = useState<string>("approvalHigh");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [judgeNameParam]);

    // Flatten all judges from judgeData
    const allJudges: SingleJudge[] = Object.values(judgeData).flatMap(
        (cityObj) => Object.values(cityObj)
    ) as SingleJudge[];

    // Find the specific judge by name
    const theJudge = allJudges.find(
        (j) => j.judge_name.toLowerCase() === judgeNameParam?.toLowerCase()
    );

    // If judge isn't found, display an error
    if (!theJudge) {
        return (
            <div className="judge-page" style={{ "--bg-image": defaultBg } as React.CSSProperties}>
                <div className="judge-content">
                    <h2 style={{ textAlign: "center", marginTop: "100px" }}>
                        {translations[currentLanguage].judgeNotFound}
                    </h2>
                </div>
            </div>
        );
    }

    // Get the background image for the judge's city
    const bg = cityImages[theJudge.city] || defaultBg;

    // Get all judges from the same city
    const cityJudgesObj = judgeData[theJudge.city] || {};
    const cityJudges: SingleJudge[] = Object.values(cityJudgesObj).map((judge) => ({
        ...judge,
        granted_asylum_percentage: parsePercentage(judge.granted_asylum_percentage),
        total_decisions: Number(judge.total_decisions),
    }));

    // Sort judges function
    const sortJudges = (judges: SingleJudge[], sortValue: string): SingleJudge[] => {
        switch (sortValue) {
            case "approvalHigh":
                return [...judges].sort(
                    (a, b) =>
                        parsePercentage(b.granted_asylum_percentage) -
                        parsePercentage(a.granted_asylum_percentage)
                );
            case "approvalLow":
                return [...judges].sort(
                    (a, b) =>
                        parsePercentage(a.granted_asylum_percentage) -
                        parsePercentage(b.granted_asylum_percentage)
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

    // Dropdown options based on language
    const dropdownOptions = SORT_OPTIONS.map((opt) => ({
        value: opt.value,
        label: translations[currentLanguage][opt.value],
    }));

    // Convert string percentages to numbers
    const asylumRate = parsePercentage(theJudge.granted_asylum_percentage);
    const otherReliefRate = parsePercentage(theJudge.granted_other_relief_percentage);
    const deniedRate = parsePercentage(theJudge.denied_percentage);
    const totalDecisions = Number(theJudge.total_decisions);

    // Calculate actual numbers of cases
    const asylumGrantedAmount = Math.round((totalDecisions * asylumRate) / 100);
    const otherGrantedAmount = Math.round((totalDecisions * otherReliefRate) / 100);
    const deniedAmount = Math.round((totalDecisions * deniedRate) / 100);

    const t = translations[currentLanguage];

    return (
        <div
          className={`judge-page ${sidebarOpen ? "sidebar-open" : ""}`}
          style={{ "--bg-image": `url(${bg})` } as React.CSSProperties}
        >
          <div className="judge-content">
            <div className={`judge-main-wrapper ${sidebarOpen ? "shifted" : ""}`}>
              <div className="judge-main-layout">
                <div className="judge-main-left">
                  <div className="judge-header-section">
                    <div className="judge-title-description">
                        <h2 className="judge-title">{theJudge.judge_name}</h2>

                        <h1 className="judge-descriptor judge-label">
                        {t.judge}
                        <img
                            src={require("../../assets/face-2.png")}
                            alt="Judge icon"
                            className="judge-icon"
                        />
                        </h1>

                        <Link to={`/city/${theJudge.city}`} style={{ textDecoration: "none" }}>
                        <h3 className="judge-descriptor judge-city">{theJudge.city}</h3>
                        </Link>
                    </div>
                    </div>

                  <div className="judge-top-stats">
                    <div className="judge-stats-box">
                      <p>
                        {t.outOf}{" "}
                        <span className="judge-cases-amount">{totalDecisions}</span>{" "}
                        total {totalDecisions === 1 ? "case" : "cases"}{" "}
                        {t.casesFor.toLowerCase()} <strong>{theJudge.judge_name}</strong>,{" "}
                        <span className="judge-asylum-granted">
                          {asylumGrantedAmount + otherGrantedAmount}
                        </span>{" "}
                        {asylumGrantedAmount + otherGrantedAmount === 1 ? "was" : "were"} granted
                        asylum or other forms of relief.
                      </p>
                    </div>
                  </div>
      
                  <div className="judge-rates-section">
                    <h2 className="judge-section-header judge-rates">{t.averageRates}</h2>
                    <p className="judge-national-average-note">
                      <span className="judge-dash-example">— - — </span> {t.nationalAverageNote}
                    </p>
      
                    <div className="judge-donut-charts-container vertical">
                      <div className="judge-donut-row">
                        <div className="judge-donut-side">
                          <div className="judge-donut-chart-div">
                            <DonutChart
                              title={t.asylumGranted}
                              percentage={asylumRate}
                              nationalAverage={45}
                              className="judge-asylum-granted-donut-chart"
                              size={180}
                              strokeWidth={20}
                              color="#6CAF5C"
                            />
                          </div>
                          <div className="judge-donut-chart-description">
                            <p>{t.asylumGranted}</p>
                            <Tooltip text={t.asylumGrantedInfo}>
                              <span className="judge-info-icon">
                                <i className="fas fa-info-circle"></i>
                              </span>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="judge-donut-textbox">
                          <p>
                            <span className="judge-asylum-granted">
                              {asylumGrantedAmount}
                            </span>{" "}
                            {asylumGrantedAmount === 1 ? "case" : "cases"}{" "}
                            {t.outOf.toLowerCase()}{" "}
                            <span className="judge-cases-amount">{totalDecisions}</span>{" "}
                            total {totalDecisions === 1 ? "case" : "cases"}{" "}
                            {t.casesFor.toLowerCase()}{" "}
                            <strong>{theJudge.judge_name}</strong> {t.wereGrantedAsylum}
                          </p>
                        </div>
                      </div>
                      <div className="judge-donut-row">
                        <div className="judge-donut-side">
                          <div className="judge-donut-chart-div">
                            <DonutChart
                              title={t.otherReliefGranted}
                              percentage={otherReliefRate}
                              nationalAverage={12}
                              className="judge-other-relief-donut-chart"
                              size={180}
                              strokeWidth={20}
                              color="#C5FBA3"
                            />
                          </div>
                          <div className="judge-donut-chart-description">
                            <p>{t.otherReliefGranted}</p>
                            <Tooltip text={t.otherReliefInfo}>
                              <span className="judge-info-icon">
                                <i className="fas fa-info-circle"></i>
                              </span>
                            </Tooltip>
                          </div>
                        </div>
      
                        <div className="judge-donut-textbox">
                          <p>
                            <span className="judge-other-granted">
                              {otherGrantedAmount}
                            </span>{" "}
                            {otherGrantedAmount === 1 ? "case" : "cases"}{" "}
                            {t.outOf.toLowerCase()}{" "}
                            <span className="judge-cases-amount">{totalDecisions}</span>{" "}
                            total {totalDecisions === 1 ? "case" : "cases"}{" "}
                            {t.casesFor.toLowerCase()}{" "}
                            <strong>{theJudge.judge_name}</strong> {t.wereGrantedOtherRelief}
                          </p>
                        </div>
                      </div>
      
                      <div className="judge-donut-row">
                        <div className="judge-donut-side">
                          <div className="judge-donut-chart-div">
                            <DonutChart
                              title={t.denied}
                              percentage={deniedRate}
                              nationalAverage={43}
                              className="judge-denied-donut-chart"
                              size={180}
                              strokeWidth={20}
                              color="#FF7A7A"
                            />
                          </div>
                          <div className="judge-donut-chart-description">
                            <p>{t.denied}</p>
                            <Tooltip text={t.deniedInfo}>
                              <span className="judge-info-icon">
                                <i className="fas fa-info-circle"></i>
                              </span>
                            </Tooltip>
                          </div>
                        </div>
      
                        <div className="judge-donut-textbox">
                          <p>
                            <span className="judge-denied-amount">{deniedAmount}</span>{" "}
                            {deniedAmount === 1 ? "case" : "cases"}{" "}
                            {t.outOf.toLowerCase()}{" "}
                            <span className="judge-cases-amount">{totalDecisions}</span>{" "}
                            total {totalDecisions === 1 ? "case" : "cases"}{" "}
                            {t.casesFor.toLowerCase()}{" "}
                            <strong>{theJudge.judge_name}</strong> {t.wereDenied}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
            <button
              className={`judge-sidebar-toggle ${sidebarOpen ? "open" : ""}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <>
                  ➤
                  <span className="judge-sidebar-tooltip">{t.hideJudges}</span>
                </>
              ) : (
                <>
                  ◄
                  <span className="judge-sidebar-tooltip">{t.showJudges}</span>
                </>
              )}
            </button>
      
            <div className={`judge-sidebar ${sidebarOpen ? "open" : ""}`}>
              <div className="judge-sidebar-content">
                <h3 className="judge-sidebar-title">
                  {t.otherJudgesIn} {theJudge.city}
                </h3>
      
                <div className="judge-sidebar-sort">
                  <label htmlFor="judge-sidebar-sort-select" className="judge-sidebar-sort-label">
                    {t.sortBy}:
                  </label>
                  <select
                    id="judge-sidebar-sort-select"
                    className="judge-sidebar-sort-select"
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
      
                <div className="judge-sidebar-list">
                  {sortedJudges.length > 0 &&
                    sortedJudges.map((judge, index) => (
                      <Link
                        to={`/judge/${encodeURIComponent(judge.judge_name)}`}
                        key={judge.judge_name}
                        className="judge-sidebar-judge-link"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div
                          className="judge-sidebar-judge-card"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="judge-sidebar-judge-row">
                            <div className="judge-sidebar-judge-left">
                              <span className="judge-sidebar-judge-name">
                                {judge.judge_name}
                              </span>
                              <span className="judge-sidebar-judge-cases">
                                {judge.total_decisions} cases
                              </span>
                            </div>
      
                            <div className="judge-sidebar-mini-donut">
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

export default JudgePage;