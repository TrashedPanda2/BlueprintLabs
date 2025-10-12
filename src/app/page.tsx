"use client";

import { useEffect, useState } from "react";
import Background from "./components/Background";

const categoryMap: Record<string, string> = {
  "0": "Assault Rifle",
  "1": "SMG",
  "2": "Shotgun",
  "3": "LMG",
  "4": "Marksman Rifle",
  "5": "Sniper",
  "6": "Pistol",
  "7": "Launchers",
  "8": "Specials",
  "9": "Melee",
};

interface BlueprintRow {
  weapon: string;
  category: string;
  blueprint: string;
  status: string;
  pool: string;
  imageBase: string;
}

export default function Home() {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideSection, setGuideSection] = useState("intro");

  const [data, setData] = useState<BlueprintRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [poolFilter, setPoolFilter] = useState("All");

  const [showCredits, setShowCredits] = useState(false);
  const [modalImageBase, setModalImageBase] = useState<string | null>(null);
  const [modalSrc, setModalSrc] = useState<string>("");
  const [modalHasPreview, setModalHasPreview] = useState(true);
  const [changelog, setChangelog] = useState<
    { version: string; date: string; changes: string[] }[]
  >([]);
  const [showUpdateLog, setShowUpdateLog] = useState(false);

  const extensions = [".jpg", ".jpeg", ".png"];

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/weapons.json");
      const json = await res.json();
      const rows: BlueprintRow[] = [];

      for (const weapon of json.Weapons) {
        for (const bp of weapon.Blueprints) {
          if (!bp.Name || bp.Name === "NOTHING") continue;
          const weaponName = weapon.Name.toLowerCase().replace(/\s+/g, "-");
          const imageBase = `/images/${weaponName}/${bp.Name}`;
          rows.push({
            weapon: weapon.Name,
            category: categoryMap[weapon.Category],
            blueprint: bp.Name,
            status: bp.status,
            pool: bp.Pool,
            imageBase,
          });
        }
      }
      setData(rows);
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadChangelog = async () => {
      const res = await fetch("/changelog.json");
      const json = await res.json();
      setChangelog(json);
    };
    loadChangelog();
  }, []);

  const openPreview = (imageBase: string) => {
    setModalImageBase(imageBase);
    setModalHasPreview(true);
    setModalSrc(`${imageBase}${extensions[0]}`);
  };

  const handleModalImgError = () => {
    if (!modalImageBase) return;
    const currentIndex = extensions.findIndex(
      (ext) => modalSrc === `${modalImageBase}${ext}`
    );
    const nextIndex = currentIndex + 1;
    if (nextIndex < extensions.length) {
      setModalSrc(`${modalImageBase}${extensions[nextIndex]}`);
    } else {
      setModalHasPreview(false);
    }
  };

  const filtered = data.filter((row) => {
    const matchesSearch =
      row.blueprint.toLowerCase().includes(search.toLowerCase()) ||
      row.weapon.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || row.status === statusFilter;
    const matchesCategory =
      categoryFilter === "All" || row.category === categoryFilter;
    const matchesPool = poolFilter === "All" || row.pool === poolFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPool;
  });

  const poolOptions = Array.from(new Set(data.map((row) => row.pool))).sort(
    (a, b) => Number(a) - Number(b)
  );

  return (
    <div>
      <Background />
      {changelog.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            left: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            zIndex: 100,
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "#ffa500" }}>
            Version: {changelog[0].version}
          </span>
          <div
            onClick={() => setShowUpdateLog(true)}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#ff8800",
              animation: "pulse 1.5s infinite",
              cursor: "pointer",
            }}
            title="View Update Log"
          />
        </div>
      )}
      <div className="container">
        <header>
          <div className="title-block">
            <img src="/logo.png" alt="Logo" style={{ height: "40px" }} />
            <h1>Blueprint Labs By: TrashedPanda</h1>
          </div>
          <div className="header-buttons">
            <button className="btn" onClick={() => setShowCredits(true)}>
              Credits
            </button>
            <button className="btn" onClick={() => setShowGuideModal(true)}>
              How to Pull Blueprints
            </button>
          </div>
        </header>

        <div className="card">
          <strong>
            Site is still in development, please be patient as we update
          </strong>
        </div>
        {/* Filters */}
        <div className="filters">
          <div className="filter-group full-width">
            <input
              id="search"
              type="text"
              placeholder="Search for blueprints or weapons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status Filter</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>RELEASED</option>
              <option>UNRELEASED</option>
              <option>NOTHING</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category Filter</label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All</option>
              {Object.values(categoryMap).map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="pool">Pool Filter</label>
            <select
              id="pool"
              value={poolFilter}
              onChange={(e) => setPoolFilter(e.target.value)}
            >
              <option>All</option>
              {poolOptions.map((pool) => (
                <option key={pool}>{pool}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table Version */}
        <div className="table-wrapper desktop-only">
          <table>
            <thead>
              <tr>
                <th>Blueprint Name</th>
                <th>Gun Name</th>
                <th>Weapon Category</th>
                <th>Status</th>
                <th>Pool</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td>{row.blueprint}</td>
                  <td>{row.weapon}</td>
                  <td>{row.category}</td>
                  <td>{row.status}</td>
                  <td>{row.pool}</td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => openPreview(row.imageBase)}
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      color: "#ccc",
                    }}
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Table Version */}
        <div className="mobile-only">
          {filtered.map((row, i) => (
            <div key={i} className="card blueprint-card">
              <h3>{row.blueprint}</h3>
              <p>
                <strong>Weapon:</strong> {row.weapon}
              </p>
              <p>
                <strong>Category:</strong> {row.category}
              </p>
              <p>
                <strong>Status:</strong> {row.status}
              </p>
              <p>
                <strong>Pool:</strong> {row.pool}
              </p>
              <button
                className="btn"
                onClick={() => openPreview(row.imageBase)}
              >
                Preview
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: "center", padding: "1rem", color: "#ccc" }}>
              No results found.
            </p>
          )}
        </div>
      </div>
      {/* Blueprint Preview Modal */}
      {modalImageBase && (
        <div className="modal" onClick={() => setModalImageBase(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalHasPreview ? (
              <img
                src={modalSrc}
                onError={handleModalImgError}
                alt="Blueprint Preview"
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              />
            ) : (
              <p
                style={{
                  textAlign: "center",
                  margin: "2rem 0",
                  color: "#ccc",
                }}
              >
                No Preview Available
              </p>
            )}
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <button className="btn" onClick={() => setModalImageBase(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits Modal */}
      {showCredits && (
        <div className="modal" onClick={() => setShowCredits(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1rem" }}>Credits</h2>
            <p style={{ marginBottom: "1rem" }}>
              BlueprintLabs is a blueprint pool website for Call of Duty weapons.
              All data is sourced from community contributions.
            </p>
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              <li>
                <strong>Design & Development:</strong> TrashedPanda
              </li>
              <li>
                <strong>Data Structuring:</strong> Data sourced by Parsedgod
              </li>
              <li>
                <strong>UI/UX:</strong> Inspired by Black Ops 6 Theme
              </li>
              <li>
                <strong>Assets:</strong> All logos, videos, and images are
                property of their respective owners
              </li>
            </ul>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button className="btn" onClick={() => setShowCredits(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* How to Blueprint Pull Modal */}
      {showGuideModal && (
        <div className="modal" onClick={() => setShowGuideModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              padding: "1rem",
              maxWidth: "600px",
              fontSize: "0.9rem",
            }}
          >
            <button
              className="btn"
              onClick={() => setShowGuideModal(false)}
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                padding: "0.25rem 0.5rem",
                fontSize: "0.8rem",
              }}
            >
              ✖
            </button>

            <h2 style={{ marginBottom: "0.5rem", fontSize: "1.2rem" }}>
              How to Pull Blueprints
            </h2>
            <div
              style={{
                display: "flex",
                gap: "0.25rem",
                marginBottom: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <button className="btn" onClick={() => setGuideSection("intro")}>
                What is Blueprint Pulling?
              </button>
              <button className="btn" onClick={() => setGuideSection("zombies")}>
                How to Pull in Zombies
              </button>
              <button className="btn" onClick={() => setGuideSection("mpwz")}>
                How to Pull in MP/WZ
              </button>
            </div>

            {guideSection === "zombies" && (
              <div style={{ marginBottom: "0.5rem" }}>
                <a
                  href="https://www.youtube.com/watch?v=AwFInwhDlus&t=746s"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#ffa500", textDecoration: "underline" }}
                >
                  ▶ Watch Video (YouTube)
                </a>
              </div>
            )}

            {guideSection === "mpwz" && (
              <div style={{ marginBottom: "0.5rem" }}>
                <a
                  href="https://www.youtube.com/watch?v=Ou1VjCpFqM8&t"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#ffa500", textDecoration: "underline" }}
                >
                  ▶ Watch Video (YouTube)
                </a>
              </div>
            )}

            <div style={{ marginBottom: "0.5rem", color: "#ccc" }}>
              {guideSection === "intro" && (
                <p>
                  Blueprint pulling is the process of extracting weapon
                  blueprints from loot pools, bundles, or in-game drops. It’s a
                  way to unlock rare cosmetics and weapon variants without direct
                  purchase.
                </p>
              )}
              {guideSection === "zombies" && (
                <p>
                  <strong>
                    Forward video to 12:56 for Zombies Pulling Method
                  </strong>
                </p>
              )}
              {guideSection === "mpwz" && (
                <p>
                  <strong>
                    In Multiplayer and Warzone, ACCOUNT MUST BE BROKEN, Foward to
                    1:32 to see how to break account.
                  </strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {showUpdateLog && (
        <div className="modal" onClick={() => setShowUpdateLog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Update Log
              {changelog.length > 0 && (
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ff8800ff",
                    animation: "pulse 1.5s infinite",
                  }}
                  title="New updates available"
                />
              )}
            </h2>
            <div style={{ color: "#ccc" }}>
              {changelog.length === 0 ? (
                <p style={{ textAlign: "center", margin: "2rem 0" }}>
                  No updates yet. Stay tuned!
                </p>
              ) : (
                changelog.map((entry, i) => (
                  <div key={i} style={{ marginBottom: "1rem" }}>
                    <h3 style={{ marginBottom: "0.25rem" }}>
                      {entry.version} — {entry.date}
                    </h3>
                    <ul style={{ paddingLeft: "1rem" }}>
                      {entry.changes.map((change, j) => (
                        <li key={j}>{change}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button className="btn" onClick={() => setShowUpdateLog(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
