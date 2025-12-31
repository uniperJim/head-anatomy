import React from 'react';
import './SkullDiagram.css';

/**
 * Interactive SVG Skull Diagram
 * Shows lateral view of the skull with labeled bones
 * Highlights the currently selected bone
 */
const SkullDiagram = ({ highlightedBone, onBoneClick, view = 'lateral' }) => {
  // Bone regions with their SVG path data (simplified skull outline)
  // These are approximate positions for a lateral skull view
  const boneRegions = {
    frontal: {
      path: "M 80,60 Q 100,30 140,25 L 160,25 Q 180,30 190,50 L 185,80 L 160,90 L 120,85 L 85,75 Z",
      label: { x: 130, y: 50 },
      latinName: "Os frontale",
      germanName: "Stirnbein",
    },
    parietal: {
      path: "M 190,50 Q 220,35 260,40 Q 290,50 300,80 L 290,120 L 250,130 L 200,120 L 185,80 Z",
      label: { x: 240, y: 80 },
      latinName: "Os parietale",
      germanName: "Scheitelbein",
    },
    temporal: {
      path: "M 200,120 L 250,130 L 280,150 Q 290,170 280,190 L 250,200 L 210,190 Q 190,170 195,150 Z",
      label: { x: 240, y: 165 },
      latinName: "Os temporale",
      germanName: "Schläfenbein",
    },
    occipital: {
      path: "M 290,120 L 300,80 Q 320,100 325,140 Q 320,180 300,200 L 280,190 Q 290,170 280,150 L 290,120 Z",
      label: { x: 305, y: 150 },
      latinName: "Os occipitale",
      germanName: "Hinterhauptbein",
    },
    sphenoid: {
      path: "M 160,90 L 185,80 L 200,120 L 195,150 L 170,160 L 150,145 L 145,115 Z",
      label: { x: 170, y: 125 },
      latinName: "Os sphenoidale",
      germanName: "Keilbein",
    },
    ethmoid: {
      path: "M 120,85 L 145,90 L 145,115 L 130,125 L 110,115 L 110,95 Z",
      label: { x: 125, y: 105 },
      latinName: "Os ethmoidale",
      germanName: "Siebbein",
    },
    maxilla: {
      path: "M 85,135 L 110,115 L 130,125 L 150,145 L 145,180 L 130,210 L 100,215 L 80,195 L 75,165 Z",
      label: { x: 110, y: 175 },
      latinName: "Maxilla",
      germanName: "Oberkiefer",
    },
    mandible: {
      path: "M 80,220 L 100,215 L 130,210 L 160,220 L 200,230 L 240,235 L 260,220 Q 270,200 265,180 L 250,200 L 210,190 L 170,195 L 145,200 L 100,230 L 70,240 Q 60,230 70,220 Z",
      label: { x: 160, y: 235 },
      latinName: "Mandibula",
      germanName: "Unterkiefer",
    },
    zygomatic: {
      path: "M 145,145 L 170,160 L 195,150 L 210,165 L 200,180 L 170,195 L 145,180 L 150,160 Z",
      label: { x: 175, y: 175 },
      latinName: "Os zygomaticum",
      germanName: "Jochbein",
    },
    nasal: {
      path: "M 85,100 L 100,95 L 110,95 L 110,115 L 100,130 L 85,135 L 80,120 Z",
      label: { x: 92, y: 115 },
      latinName: "Os nasale",
      germanName: "Nasenbein",
    },
    lacrimal: {
      path: "M 100,115 L 110,115 L 115,130 L 105,135 Z",
      label: { x: 105, y: 125 },
      latinName: "Os lacrimale",
      germanName: "Tränenbein",
    },
  };

  // Important foramina positions
  const foramina = {
    foramen_magnum: { x: 310, y: 190, label: "Foramen magnum" },
    external_acoustic_meatus: { x: 255, y: 175, label: "Meatus acusticus ext." },
    supraorbital_foramen: { x: 115, y: 95, label: "For. supraorbitale" },
    infraorbital_foramen: { x: 100, y: 155, label: "For. infraorbitale" },
    mental_foramen: { x: 95, y: 225, label: "For. mentale" },
    stylomastoid_foramen: { x: 270, y: 195, label: "For. stylomastoideum" },
  };

  // Sutures
  const sutures = {
    coronal: { path: "M 160,25 Q 175,60 185,80 Q 190,100 195,120", label: "Sutura coronalis" },
    sagittal: { path: "M 190,50 Q 230,45 260,40", label: "Sutura sagittalis" },
    lambdoid: { path: "M 290,120 Q 295,100 300,80", label: "Sutura lambdoidea" },
    squamous: { path: "M 200,120 Q 220,125 250,130", label: "Sutura squamosa" },
  };

  const isHighlighted = (boneId) => {
    if (!highlightedBone) return false;
    return highlightedBone.toLowerCase() === boneId.toLowerCase() || 
           boneRegions[boneId]?.latinName.toLowerCase().includes(highlightedBone.toLowerCase()) ||
           boneRegions[boneId]?.germanName.toLowerCase().includes(highlightedBone.toLowerCase());
  };

  return (
    <div className="skull-diagram">
      <div className="diagram-header">
        <h4>Schädel - Lateralansicht</h4>
        <p className="diagram-hint">Klicke auf einen Knochen für Details</p>
      </div>
      
      <svg 
        viewBox="40 10 300 250" 
        className="skull-svg"
        aria-label="Lateral view of the human skull"
      >
        {/* Background skull outline */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a3a4a" />
            <stop offset="100%" stopColor="#2a2a3a" />
          </linearGradient>
          <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="100%" stopColor="#b8956a" />
          </linearGradient>
        </defs>

        {/* Sutures */}
        {Object.entries(sutures).map(([id, suture]) => (
          <path
            key={id}
            d={suture.path}
            className="suture-line"
            fill="none"
            stroke="#666"
            strokeWidth="1"
            strokeDasharray="3,2"
          />
        ))}

        {/* Bone regions */}
        {Object.entries(boneRegions).map(([id, bone]) => (
          <g key={id} className="bone-group">
            <path
              d={bone.path}
              className={`bone-region ${isHighlighted(id) ? 'highlighted' : ''}`}
              fill={isHighlighted(id) ? "url(#highlightGradient)" : "url(#boneGradient)"}
              stroke={isHighlighted(id) ? "#d4a574" : "#555"}
              strokeWidth={isHighlighted(id) ? "2" : "1"}
              filter={isHighlighted(id) ? "url(#glow)" : "none"}
              onClick={() => onBoneClick && onBoneClick(id)}
              style={{ cursor: onBoneClick ? 'pointer' : 'default' }}
            />
            {/* Bone label */}
            <text
              x={bone.label.x}
              y={bone.label.y}
              className={`bone-label ${isHighlighted(id) ? 'highlighted' : ''}`}
              textAnchor="middle"
              fontSize="8"
              fill={isHighlighted(id) ? "#fff" : "#999"}
            >
              {bone.latinName}
            </text>
          </g>
        ))}

        {/* Orbit (eye socket) */}
        <ellipse
          cx="115"
          cy="115"
          rx="25"
          ry="20"
          fill="#1a1a2e"
          stroke="#444"
          strokeWidth="1"
        />

        {/* Nasal aperture */}
        <path
          d="M 90,140 Q 85,155 90,170 L 100,175 Q 110,160 105,145 Z"
          fill="#1a1a2e"
          stroke="#444"
          strokeWidth="1"
        />

        {/* Foramina markers */}
        {Object.entries(foramina).map(([id, foramen]) => (
          <g key={id} className="foramen-marker">
            <circle
              cx={foramen.x}
              cy={foramen.y}
              r="3"
              fill="#8b0000"
              stroke="#fff"
              strokeWidth="0.5"
            />
          </g>
        ))}

        {/* Mastoid process indicator */}
        <circle cx="275" cy="200" r="8" fill="none" stroke="#666" strokeWidth="1" strokeDasharray="2,1" />
        <text x="275" y="215" fontSize="6" fill="#777" textAnchor="middle">Proc. mast.</text>

        {/* Zygomatic arch label */}
        <text x="210" y="155" fontSize="6" fill="#777" textAnchor="middle">Arcus zyg.</text>
      </svg>

      {highlightedBone && boneRegions[highlightedBone.toLowerCase()] && (
        <div className="bone-info-overlay">
          <span className="latin-name">{boneRegions[highlightedBone.toLowerCase()].latinName}</span>
          <span className="german-name">{boneRegions[highlightedBone.toLowerCase()].germanName}</span>
        </div>
      )}
    </div>
  );
};

export default SkullDiagram;
