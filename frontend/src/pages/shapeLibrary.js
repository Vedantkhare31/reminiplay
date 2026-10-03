// =============================================================================
// COMPREHENSIVE SHAPE LIBRARY — 120+ Categorized Geometric Shapes with Tiered Difficulty
// =============================================================================

export const SHAPES_DATA = [
  {
    "key": "square_std",
    "name": "Square",
    "icon": "□",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Standard Square",
    "points": [
      {
        "x": 0.25,
        "y": 0.25
      },
      {
        "x": 0.75,
        "y": 0.25
      },
      {
        "x": 0.75,
        "y": 0.75
      },
      {
        "x": 0.25,
        "y": 0.75
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Draw Top edge to Right",
      "Draw Right edge Down",
      "Draw Bottom edge Left",
      "Close back to Top-Left"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "square_compact",
    "name": "Compact Square",
    "icon": "▫️",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Small Centered Square",
    "points": [
      {
        "x": 0.32,
        "y": 0.32
      },
      {
        "x": 0.68,
        "y": 0.32
      },
      {
        "x": 0.68,
        "y": 0.68
      },
      {
        "x": 0.32,
        "y": 0.68
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Draw Top side",
      "Draw Right side",
      "Draw Bottom side",
      "Close back"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "square_large",
    "name": "Large Square",
    "icon": "⏹️",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Expansive Square",
    "points": [
      {
        "x": 0.18,
        "y": 0.18
      },
      {
        "x": 0.82,
        "y": 0.18
      },
      {
        "x": 0.82,
        "y": 0.82
      },
      {
        "x": 0.18,
        "y": 0.82
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Across Top edge",
      "Down Right edge",
      "Across Bottom edge",
      "Up Left edge"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "rect_std",
    "name": "Rectangle",
    "icon": "▭",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Standard Rectangle",
    "points": [
      {
        "x": 0.2,
        "y": 0.3
      },
      {
        "x": 0.8,
        "y": 0.3
      },
      {
        "x": 0.8,
        "y": 0.7
      },
      {
        "x": 0.2,
        "y": 0.7
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Top edge across to Right",
      "Right edge Down",
      "Bottom edge Left",
      "Close back to Top-Left"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "rect_wide",
    "name": "Wide Rectangle",
    "icon": "▬",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Wide Panorama Rectangle",
    "points": [
      {
        "x": 0.12,
        "y": 0.35
      },
      {
        "x": 0.88,
        "y": 0.35
      },
      {
        "x": 0.88,
        "y": 0.65
      },
      {
        "x": 0.12,
        "y": 0.65
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Long Top edge to Right",
      "Short Right edge Down",
      "Long Bottom edge Left",
      "Close back to Top-Left"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "rect_tall",
    "name": "Tall Rectangle",
    "icon": "▯",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Vertical Pillar Rectangle",
    "points": [
      {
        "x": 0.3,
        "y": 0.15
      },
      {
        "x": 0.7,
        "y": 0.15
      },
      {
        "x": 0.7,
        "y": 0.85
      },
      {
        "x": 0.3,
        "y": 0.85
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Top edge across",
      "Down long Right edge",
      "Bottom edge across",
      "Up long Left edge"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "triangle_eq",
    "name": "Triangle",
    "icon": "△",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Equilateral Triangle",
    "points": [
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.85,
        "y": 0.82
      },
      {
        "x": 0.15,
        "y": 0.82
      }
    ],
    "stepDescriptions": [
      "Top Peak start",
      "Down right slant",
      "Flat base to Left",
      "Up left slant to Peak"
    ],
    "waypointLabels": [
      "Top Peak",
      "Bottom-Right",
      "Bottom-Left",
      "Close at Peak"
    ]
  },
  {
    "key": "triangle_inv",
    "name": "Inverted Triangle",
    "icon": "▽",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Inverted Triangle",
    "points": [
      {
        "x": 0.5,
        "y": 0.82
      },
      {
        "x": 0.85,
        "y": 0.18
      },
      {
        "x": 0.15,
        "y": 0.18
      }
    ],
    "stepDescriptions": [
      "Bottom Point start",
      "Up right slant",
      "Flat top edge Left",
      "Down left slant to Point"
    ],
    "waypointLabels": [
      "Bottom Tip",
      "Top-Right",
      "Top-Left",
      "Close at Tip"
    ]
  },
  {
    "key": "triangle_right",
    "name": "Right Triangle",
    "icon": "📐",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Right-Angle Triangle",
    "points": [
      {
        "x": 0.2,
        "y": 0.2
      },
      {
        "x": 0.2,
        "y": 0.8
      },
      {
        "x": 0.8,
        "y": 0.8
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Straight down vertical edge",
      "Flat base to Right",
      "Hypotenuse back to Top-Left"
    ],
    "waypointLabels": [
      "Top",
      "Corner",
      "Base End",
      "Close"
    ]
  },
  {
    "key": "triangle_narrow",
    "name": "Narrow Triangle",
    "icon": "▲",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Tall Narrow Triangle",
    "points": [
      {
        "x": 0.5,
        "y": 0.12
      },
      {
        "x": 0.75,
        "y": 0.88
      },
      {
        "x": 0.25,
        "y": 0.88
      }
    ],
    "stepDescriptions": [
      "Peak start",
      "Steep right slope",
      "Short base",
      "Steep left slope"
    ],
    "waypointLabels": [
      "Peak",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "diamond_std",
    "name": "Diamond",
    "icon": "◇",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Standard Diamond / Rhombus",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.85,
        "y": 0.5
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.15,
        "y": 0.5
      }
    ],
    "stepDescriptions": [
      "Top Point start",
      "Down to Right point",
      "Down to Bottom point",
      "Up to Left point",
      "Close back to Top point"
    ],
    "waypointLabels": [
      "Top",
      "Right",
      "Bottom",
      "Left",
      "Close"
    ]
  },
  {
    "key": "diamond_wide",
    "name": "Wide Diamond",
    "icon": "⬖",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Wide Gem Diamond",
    "points": [
      {
        "x": 0.5,
        "y": 0.25
      },
      {
        "x": 0.9,
        "y": 0.5
      },
      {
        "x": 0.5,
        "y": 0.75
      },
      {
        "x": 0.1,
        "y": 0.5
      }
    ],
    "stepDescriptions": [
      "Top point",
      "Out to Right point",
      "In to Bottom point",
      "Out to Left point",
      "Close at Top"
    ],
    "waypointLabels": [
      "Top",
      "Right",
      "Bottom",
      "Left",
      "Close"
    ]
  },
  {
    "key": "circle_std",
    "name": "Circle",
    "icon": "○",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Standard Circle",
    "points": [
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.6225,
        "y": 0.2044
      },
      {
        "x": 0.7263,
        "y": 0.2737
      },
      {
        "x": 0.7956,
        "y": 0.3775
      },
      {
        "x": 0.82,
        "y": 0.5
      },
      {
        "x": 0.7956,
        "y": 0.6225
      },
      {
        "x": 0.7263,
        "y": 0.7263
      },
      {
        "x": 0.6225,
        "y": 0.7956
      },
      {
        "x": 0.5,
        "y": 0.82
      },
      {
        "x": 0.3775,
        "y": 0.7956
      },
      {
        "x": 0.2737,
        "y": 0.7263
      },
      {
        "x": 0.2044,
        "y": 0.6225
      },
      {
        "x": 0.18,
        "y": 0.5
      },
      {
        "x": 0.2044,
        "y": 0.3775
      },
      {
        "x": 0.2737,
        "y": 0.2737
      },
      {
        "x": 0.3775,
        "y": 0.2044
      }
    ],
    "stepDescriptions": [
      "Top start (12 o'clock)",
      "Curve Right (3 o'clock)",
      "Curve Bottom (6 o'clock)",
      "Curve Left (9 o'clock)",
      "Close at Top"
    ],
    "waypointLabels": [
      "Top",
      "Right",
      "Bottom",
      "Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      0
    ]
  },
  {
    "key": "circle_small",
    "name": "Small Circle",
    "icon": "⏺️",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Compact Circle",
    "points": [
      {
        "x": 0.5,
        "y": 0.26
      },
      {
        "x": 0.5918,
        "y": 0.2783
      },
      {
        "x": 0.6697,
        "y": 0.3303
      },
      {
        "x": 0.7217,
        "y": 0.4082
      },
      {
        "x": 0.74,
        "y": 0.5
      },
      {
        "x": 0.7217,
        "y": 0.5918
      },
      {
        "x": 0.6697,
        "y": 0.6697
      },
      {
        "x": 0.5918,
        "y": 0.7217
      },
      {
        "x": 0.5,
        "y": 0.74
      },
      {
        "x": 0.4082,
        "y": 0.7217
      },
      {
        "x": 0.3303,
        "y": 0.6697
      },
      {
        "x": 0.2783,
        "y": 0.5918
      },
      {
        "x": 0.26,
        "y": 0.5
      },
      {
        "x": 0.2783,
        "y": 0.4082
      },
      {
        "x": 0.3303,
        "y": 0.3303
      },
      {
        "x": 0.4082,
        "y": 0.2783
      }
    ],
    "stepDescriptions": [
      "Top start",
      "Curve right",
      "Curve bottom",
      "Curve left",
      "Close at top"
    ],
    "waypointLabels": [
      "Top",
      "Right",
      "Bottom",
      "Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      0
    ]
  },
  {
    "key": "circle_large",
    "name": "Large Circle",
    "icon": "⚪",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Big Target Circle",
    "points": [
      {
        "x": 0.5,
        "y": 0.12
      },
      {
        "x": 0.6454,
        "y": 0.1489
      },
      {
        "x": 0.7687,
        "y": 0.2313
      },
      {
        "x": 0.8511,
        "y": 0.3546
      },
      {
        "x": 0.88,
        "y": 0.5
      },
      {
        "x": 0.8511,
        "y": 0.6454
      },
      {
        "x": 0.7687,
        "y": 0.7687
      },
      {
        "x": 0.6454,
        "y": 0.8511
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.3546,
        "y": 0.8511
      },
      {
        "x": 0.2313,
        "y": 0.7687
      },
      {
        "x": 0.1489,
        "y": 0.6454
      },
      {
        "x": 0.12,
        "y": 0.5
      },
      {
        "x": 0.1489,
        "y": 0.3546
      },
      {
        "x": 0.2313,
        "y": 0.2313
      },
      {
        "x": 0.3546,
        "y": 0.1489
      }
    ],
    "stepDescriptions": [
      "Top start",
      "Sweep right lobe",
      "Sweep bottom lobe",
      "Sweep left lobe",
      "Close at top"
    ],
    "waypointLabels": [
      "Top",
      "Right",
      "Bottom",
      "Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      0
    ]
  },
  {
    "key": "plus_simple",
    "name": "Simple Cross",
    "icon": "➕",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Plus Sign Cross",
    "points": [
      {
        "x": 0.4,
        "y": 0.15
      },
      {
        "x": 0.6,
        "y": 0.15
      },
      {
        "x": 0.6,
        "y": 0.4
      },
      {
        "x": 0.85,
        "y": 0.4
      },
      {
        "x": 0.85,
        "y": 0.6
      },
      {
        "x": 0.6,
        "y": 0.6
      },
      {
        "x": 0.6,
        "y": 0.85
      },
      {
        "x": 0.4,
        "y": 0.85
      },
      {
        "x": 0.4,
        "y": 0.6
      },
      {
        "x": 0.15,
        "y": 0.6
      },
      {
        "x": 0.15,
        "y": 0.4
      },
      {
        "x": 0.4,
        "y": 0.4
      }
    ],
    "stepDescriptions": [
      "Top-Left of top arm",
      "Top cap",
      "Inner right corner",
      "Right arm end",
      "Right cap",
      "Inner bot-right",
      "Bottom cap",
      "Inner bot-left",
      "Left arm end",
      "Left cap",
      "Inner top-left",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
      "P10",
      "P11",
      "Close"
    ],
    "waypointIndices": [
      0,
      3,
      6,
      9,
      0
    ]
  },
  {
    "key": "trapezoid_std",
    "name": "Trapezoid",
    "icon": "⏢",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Standard Trapezoid",
    "points": [
      {
        "x": 0.3,
        "y": 0.25
      },
      {
        "x": 0.7,
        "y": 0.25
      },
      {
        "x": 0.85,
        "y": 0.75
      },
      {
        "x": 0.15,
        "y": 0.75
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Narrow top edge to Right",
      "Slant down to Bottom-Right",
      "Wide base to Bottom-Left",
      "Slant up to Top-Left"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "trapezoid_inv",
    "name": "Inverted Trapezoid",
    "icon": "⏣",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Inverted Trapezoid Basin",
    "points": [
      {
        "x": 0.15,
        "y": 0.25
      },
      {
        "x": 0.85,
        "y": 0.25
      },
      {
        "x": 0.7,
        "y": 0.75
      },
      {
        "x": 0.3,
        "y": 0.75
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Wide top edge to Right",
      "Slant down to Bottom-Right",
      "Narrow base to Bottom-Left",
      "Slant up to Top-Left"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "parallelogram_right",
    "name": "Slanted Quadrilateral",
    "icon": "▱",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Right-Slanted Parallelogram",
    "points": [
      {
        "x": 0.35,
        "y": 0.25
      },
      {
        "x": 0.85,
        "y": 0.25
      },
      {
        "x": 0.65,
        "y": 0.75
      },
      {
        "x": 0.15,
        "y": 0.75
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Top edge to Right",
      "Slanted Right edge",
      "Bottom edge to Left",
      "Slanted Left edge to close"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "parallelogram_left",
    "name": "Left Parallelogram",
    "icon": "▰",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Left-Slanted Parallelogram",
    "points": [
      {
        "x": 0.15,
        "y": 0.25
      },
      {
        "x": 0.65,
        "y": 0.25
      },
      {
        "x": 0.85,
        "y": 0.75
      },
      {
        "x": 0.35,
        "y": 0.75
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Top edge to Right",
      "Down-right edge",
      "Bottom edge to Left",
      "Up-left edge to close"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "chevron_down",
    "name": "Down Chevron",
    "icon": "⌄",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Downward Chevron Arrow",
    "points": [
      {
        "x": 0.15,
        "y": 0.35
      },
      {
        "x": 0.5,
        "y": 0.75
      },
      {
        "x": 0.85,
        "y": 0.35
      },
      {
        "x": 0.7,
        "y": 0.35
      },
      {
        "x": 0.5,
        "y": 0.58
      },
      {
        "x": 0.3,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Top-Left wing",
      "Down to apex",
      "Up to Top-Right wing",
      "Inner right shelf",
      "Inner notch",
      "Inner left shelf"
    ],
    "waypointLabels": [
      "P1",
      "Apex",
      "P2",
      "P3",
      "Notch",
      "Close"
    ]
  },
  {
    "key": "chevron_up",
    "name": "Up Chevron",
    "icon": "⌃",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Upward Chevron Arrow",
    "points": [
      {
        "x": 0.15,
        "y": 0.65
      },
      {
        "x": 0.5,
        "y": 0.25
      },
      {
        "x": 0.85,
        "y": 0.65
      },
      {
        "x": 0.7,
        "y": 0.65
      },
      {
        "x": 0.5,
        "y": 0.42
      },
      {
        "x": 0.3,
        "y": 0.65
      }
    ],
    "stepDescriptions": [
      "Bottom-Left wing",
      "Up to Peak",
      "Down to Bottom-Right wing",
      "Inner shelf",
      "Inner notch",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "Peak",
      "P2",
      "P3",
      "Notch",
      "Close"
    ]
  },
  {
    "key": "kite_shape",
    "name": "Kite Shape",
    "icon": "🪁",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Geometric Kite",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.8,
        "y": 0.4
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.2,
        "y": 0.4
      }
    ],
    "stepDescriptions": [
      "Top Apex start",
      "Down to Right wing",
      "Long tail to Bottom tip",
      "Up to Left wing",
      "Close at Apex"
    ],
    "waypointLabels": [
      "Top",
      "Right Wing",
      "Tail",
      "Left Wing",
      "Close"
    ]
  },
  {
    "key": "oval_wide",
    "name": "Wide Oval",
    "icon": "⬭",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Horizontal Oval",
    "points": [
      {
        "x": 0.5,
        "y": 0.29
      },
      {
        "x": 0.6339,
        "y": 0.306
      },
      {
        "x": 0.7475,
        "y": 0.3515
      },
      {
        "x": 0.8234,
        "y": 0.4197
      },
      {
        "x": 0.85,
        "y": 0.5
      },
      {
        "x": 0.8234,
        "y": 0.5803
      },
      {
        "x": 0.7475,
        "y": 0.6485
      },
      {
        "x": 0.6339,
        "y": 0.694
      },
      {
        "x": 0.5,
        "y": 0.71
      },
      {
        "x": 0.3661,
        "y": 0.694
      },
      {
        "x": 0.2525,
        "y": 0.6485
      },
      {
        "x": 0.1766,
        "y": 0.5803
      },
      {
        "x": 0.15,
        "y": 0.5
      },
      {
        "x": 0.1766,
        "y": 0.4197
      },
      {
        "x": 0.2525,
        "y": 0.3515
      },
      {
        "x": 0.3661,
        "y": 0.306
      }
    ],
    "stepDescriptions": [
      "Top start",
      "Curve around Right side",
      "Curve to Bottom",
      "Curve around Left side",
      "Close at Top"
    ],
    "waypointLabels": [
      "Top",
      "Right",
      "Bottom",
      "Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      0
    ]
  },
  {
    "key": "oval_tall",
    "name": "Tall Oval",
    "icon": "⬯",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Vertical Egg Oval",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.5803,
        "y": 0.1766
      },
      {
        "x": 0.6485,
        "y": 0.2525
      },
      {
        "x": 0.694,
        "y": 0.3661
      },
      {
        "x": 0.71,
        "y": 0.5
      },
      {
        "x": 0.694,
        "y": 0.6339
      },
      {
        "x": 0.6485,
        "y": 0.7475
      },
      {
        "x": 0.5803,
        "y": 0.8234
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.4197,
        "y": 0.8234
      },
      {
        "x": 0.3515,
        "y": 0.7475
      },
      {
        "x": 0.306,
        "y": 0.6339
      },
      {
        "x": 0.29,
        "y": 0.5
      },
      {
        "x": 0.306,
        "y": 0.3661
      },
      {
        "x": 0.3515,
        "y": 0.2525
      },
      {
        "x": 0.4197,
        "y": 0.1766
      }
    ],
    "stepDescriptions": [
      "Top start",
      "Curve around Right side",
      "Curve to Bottom",
      "Curve around Left side",
      "Close at Top"
    ],
    "waypointLabels": [
      "Top",
      "Right",
      "Bottom",
      "Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      0
    ]
  },
  {
    "key": "semi_circle_top",
    "name": "Top Half-Circle",
    "icon": "◠",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Dome Half Circle",
    "points": [
      {
        "x": 0.15,
        "y": 0.65
      },
      {
        "x": 0.2,
        "y": 0.45
      },
      {
        "x": 0.35,
        "y": 0.28
      },
      {
        "x": 0.5,
        "y": 0.22
      },
      {
        "x": 0.65,
        "y": 0.28
      },
      {
        "x": 0.8,
        "y": 0.45
      },
      {
        "x": 0.85,
        "y": 0.65
      }
    ],
    "stepDescriptions": [
      "Left base start",
      "Curve over the dome to Right base",
      "Draw flat floor back to Left base"
    ],
    "waypointLabels": [
      "Left Base",
      "Dome Peak",
      "Right Base",
      "Close"
    ],
    "waypointIndices": [
      0,
      3,
      6,
      0
    ]
  },
  {
    "key": "house_simple",
    "name": "Simple House",
    "icon": "🏠",
    "tier": 1,
    "difficulty": "Easy",
    "description": "5-Point House Outline",
    "points": [
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.82,
        "y": 0.45
      },
      {
        "x": 0.75,
        "y": 0.82
      },
      {
        "x": 0.25,
        "y": 0.82
      },
      {
        "x": 0.18,
        "y": 0.45
      }
    ],
    "stepDescriptions": [
      "Roof peak start",
      "Right roof slope to Eave",
      "Down Right wall to Ground",
      "Floor to Left wall",
      "Up Left wall to Eave",
      "Roof slope back to Peak"
    ],
    "waypointLabels": [
      "Roof Peak",
      "Right Eave",
      "Bottom-Right",
      "Bottom-Left",
      "Left Eave",
      "Close"
    ]
  },
  {
    "key": "cross_t",
    "name": "T-Bar Cross",
    "icon": "⊤",
    "tier": 1,
    "difficulty": "Easy",
    "description": "T-Bar Silhouette",
    "points": [
      {
        "x": 0.15,
        "y": 0.25
      },
      {
        "x": 0.85,
        "y": 0.25
      },
      {
        "x": 0.85,
        "y": 0.4
      },
      {
        "x": 0.6,
        "y": 0.4
      },
      {
        "x": 0.6,
        "y": 0.85
      },
      {
        "x": 0.4,
        "y": 0.85
      },
      {
        "x": 0.4,
        "y": 0.4
      },
      {
        "x": 0.15,
        "y": 0.4
      }
    ],
    "stepDescriptions": [
      "Top-Left of bar",
      "Top bar right",
      "Right bar drop",
      "Right stem notch",
      "Stem bottom right",
      "Stem bottom left",
      "Left stem notch",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "Close"
    ]
  },
  {
    "key": "l_frame",
    "name": "L-Angle Frame",
    "icon": "𠃊",
    "tier": 1,
    "difficulty": "Easy",
    "description": "L-Shape Silhouette",
    "points": [
      {
        "x": 0.2,
        "y": 0.2
      },
      {
        "x": 0.4,
        "y": 0.2
      },
      {
        "x": 0.4,
        "y": 0.65
      },
      {
        "x": 0.8,
        "y": 0.65
      },
      {
        "x": 0.8,
        "y": 0.85
      },
      {
        "x": 0.2,
        "y": 0.85
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Short top shelf",
      "Inner corner down",
      "Bottom arm right",
      "Bottom-Right end",
      "Long bottom base to close"
    ],
    "waypointLabels": [
      "Top",
      "Shelf",
      "Corner",
      "End",
      "Base Corner",
      "Close"
    ]
  },
  {
    "key": "wedge_block",
    "name": "Wedge Ramp",
    "icon": "⊿",
    "tier": 1,
    "difficulty": "Easy",
    "description": "Ramp Wedge",
    "points": [
      {
        "x": 0.18,
        "y": 0.82
      },
      {
        "x": 0.18,
        "y": 0.45
      },
      {
        "x": 0.82,
        "y": 0.82
      }
    ],
    "stepDescriptions": [
      "Bottom-Left start",
      "Up vertical wall",
      "Slanted ramp down to Right tip",
      "Floor back to start"
    ],
    "waypointLabels": [
      "Bottom-Left",
      "Top-Left",
      "Ramp End",
      "Close"
    ]
  },
  {
    "key": "pentagon_reg",
    "name": "Pentagon",
    "icon": "⬠",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Regular 5-Sided Pentagon",
    "points": [
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.8234,
        "y": 0.4149
      },
      {
        "x": 0.6998,
        "y": 0.7951
      },
      {
        "x": 0.3002,
        "y": 0.7951
      },
      {
        "x": 0.1766,
        "y": 0.4149
      }
    ],
    "stepDescriptions": [
      "Top peak start",
      "Draw to Top-Right",
      "Draw to Bottom-Right",
      "Flat base to Bottom-Left",
      "Draw to Top-Left",
      "Close at Top"
    ],
    "waypointLabels": [
      "Top",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Top-Left",
      "Close"
    ]
  },
  {
    "key": "pentagon_inv",
    "name": "Inverted Pentagon",
    "icon": "⬟",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Inverted Pentagon",
    "points": [
      {
        "x": 0.5,
        "y": 0.82
      },
      {
        "x": 0.1766,
        "y": 0.5851
      },
      {
        "x": 0.3002,
        "y": 0.2049
      },
      {
        "x": 0.6998,
        "y": 0.2049
      },
      {
        "x": 0.8234,
        "y": 0.5851
      }
    ],
    "stepDescriptions": [
      "Bottom tip start",
      "Draw to Bottom-Left",
      "Draw to Top-Left",
      "Flat roof to Top-Right",
      "Draw to Bottom-Right",
      "Close at Bottom tip"
    ],
    "waypointLabels": [
      "Bottom Tip",
      "Bottom-Left",
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Close"
    ]
  },
  {
    "key": "hexagon_reg",
    "name": "Hexagon",
    "icon": "⬡",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Honeycomb Hexagon",
    "points": [
      {
        "x": 0.5,
        "y": 0.16
      },
      {
        "x": 0.7944,
        "y": 0.33
      },
      {
        "x": 0.7944,
        "y": 0.67
      },
      {
        "x": 0.5,
        "y": 0.84
      },
      {
        "x": 0.2056,
        "y": 0.67
      },
      {
        "x": 0.2056,
        "y": 0.33
      }
    ],
    "stepDescriptions": [
      "Top peak start",
      "Upper-Right edge",
      "Lower-Right edge",
      "Bottom peak",
      "Lower-Left edge",
      "Upper-Left edge",
      "Close at Top"
    ],
    "waypointLabels": [
      "Top",
      "Upper-Right",
      "Lower-Right",
      "Bottom",
      "Lower-Left",
      "Upper-Left",
      "Close"
    ]
  },
  {
    "key": "heptagon_reg",
    "name": "Heptagon",
    "icon": "⎔",
    "tier": 2,
    "difficulty": "Medium",
    "description": "7-Sided Regular Heptagon",
    "points": [
      {
        "x": 0.5,
        "y": 0.16
      },
      {
        "x": 0.7658,
        "y": 0.288
      },
      {
        "x": 0.8315,
        "y": 0.5757
      },
      {
        "x": 0.6475,
        "y": 0.8063
      },
      {
        "x": 0.3525,
        "y": 0.8063
      },
      {
        "x": 0.1685,
        "y": 0.5757
      },
      {
        "x": 0.2342,
        "y": 0.288
      }
    ],
    "stepDescriptions": [
      "Top start",
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "Close at Top"
    ],
    "waypointLabels": [
      "Top",
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "Close"
    ]
  },
  {
    "key": "octagon_reg",
    "name": "Octagon",
    "icon": "🛑",
    "tier": 2,
    "difficulty": "Medium",
    "description": "8-Sided Stop Sign Octagon",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.7475,
        "y": 0.2525
      },
      {
        "x": 0.85,
        "y": 0.5
      },
      {
        "x": 0.7475,
        "y": 0.7475
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.2525,
        "y": 0.7475
      },
      {
        "x": 0.15,
        "y": 0.5
      },
      {
        "x": 0.2525,
        "y": 0.2525
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Top edge",
      "Top-right slant",
      "Right edge",
      "Bottom-right slant",
      "Bottom edge",
      "Bottom-left slant",
      "Left edge",
      "Close"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Right-Top",
      "Right-Bot",
      "Bot-Right",
      "Bot-Left",
      "Left-Bot",
      "Left-Top",
      "Close"
    ]
  },
  {
    "key": "star_5pt",
    "name": "5-Point Star",
    "icon": "★",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Classic 5-Pointed Star",
    "points": [
      {
        "x": 0.5,
        "y": 0.14
      },
      {
        "x": 0.594,
        "y": 0.3706
      },
      {
        "x": 0.8424,
        "y": 0.3888
      },
      {
        "x": 0.6522,
        "y": 0.5494
      },
      {
        "x": 0.7116,
        "y": 0.7912
      },
      {
        "x": 0.5,
        "y": 0.66
      },
      {
        "x": 0.2884,
        "y": 0.7912
      },
      {
        "x": 0.3478,
        "y": 0.5494
      },
      {
        "x": 0.1576,
        "y": 0.3888
      },
      {
        "x": 0.406,
        "y": 0.3706
      }
    ],
    "stepDescriptions": [
      "Top tip start",
      "Inner notch right",
      "Right upper tip",
      "Inner notch bot-right",
      "Right lower tip",
      "Inner bot notch",
      "Left lower tip",
      "Inner notch bot-left",
      "Left upper tip",
      "Inner notch top-left",
      "Close"
    ],
    "waypointLabels": [
      "Top Tip",
      "Inner 1",
      "Right Tip",
      "Inner 2",
      "Bot-Right",
      "Inner 3",
      "Bot-Left",
      "Inner 4",
      "Left Tip",
      "Inner 5",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      0
    ]
  },
  {
    "key": "star_4pt",
    "name": "4-Point Star",
    "icon": "✦",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Diamond Sparkle Star",
    "points": [
      {
        "x": 0.5,
        "y": 0.12
      },
      {
        "x": 0.5849,
        "y": 0.4151
      },
      {
        "x": 0.88,
        "y": 0.5
      },
      {
        "x": 0.5849,
        "y": 0.5849
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.4151,
        "y": 0.5849
      },
      {
        "x": 0.12,
        "y": 0.5
      },
      {
        "x": 0.4151,
        "y": 0.4151
      }
    ],
    "stepDescriptions": [
      "Top point start",
      "Inner notch",
      "Right point",
      "Inner notch",
      "Bottom point",
      "Inner notch",
      "Left point",
      "Close at Top"
    ],
    "waypointLabels": [
      "Top",
      "Right",
      "Bottom",
      "Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      0
    ]
  },
  {
    "key": "heart_classic",
    "name": "Heart",
    "icon": "♥",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Classic Love Heart",
    "points": [
      {
        "x": 0.18,
        "y": 0.4
      },
      {
        "x": 0.2116,
        "y": 0.3078
      },
      {
        "x": 0.2922,
        "y": 0.25
      },
      {
        "x": 0.3869,
        "y": 0.2479
      },
      {
        "x": 0.46,
        "y": 0.2948
      },
      {
        "x": 0.4945,
        "y": 0.3537
      },
      {
        "x": 0.5,
        "y": 0.38
      },
      {
        "x": 0.5055,
        "y": 0.3537
      },
      {
        "x": 0.54,
        "y": 0.2948
      },
      {
        "x": 0.6131,
        "y": 0.2479
      },
      {
        "x": 0.7078,
        "y": 0.25
      },
      {
        "x": 0.7884,
        "y": 0.3078
      },
      {
        "x": 0.82,
        "y": 0.4
      },
      {
        "x": 0.7884,
        "y": 0.499
      },
      {
        "x": 0.7078,
        "y": 0.59
      },
      {
        "x": 0.6131,
        "y": 0.6721
      },
      {
        "x": 0.54,
        "y": 0.7452
      },
      {
        "x": 0.5055,
        "y": 0.7995
      },
      {
        "x": 0.5,
        "y": 0.82
      },
      {
        "x": 0.4945,
        "y": 0.7995
      },
      {
        "x": 0.46,
        "y": 0.7452
      },
      {
        "x": 0.3869,
        "y": 0.6721
      },
      {
        "x": 0.2922,
        "y": 0.59
      },
      {
        "x": 0.2116,
        "y": 0.499
      }
    ],
    "stepDescriptions": [
      "Center cleft start",
      "Curve around Right lobe",
      "Trace down to Bottom point",
      "Curve around Left lobe",
      "Close at Center cleft"
    ],
    "waypointLabels": [
      "Cleft",
      "Right Lobe",
      "Bottom Tip",
      "Left Lobe",
      "Close"
    ],
    "waypointIndices": [
      0,
      6,
      12,
      18,
      0
    ]
  },
  {
    "key": "heart_wide",
    "name": "Wide Heart",
    "icon": "💖",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Wide Heart Silhouette",
    "points": [
      {
        "x": 0.1235,
        "y": 0.3659
      },
      {
        "x": 0.1607,
        "y": 0.2574
      },
      {
        "x": 0.2555,
        "y": 0.1894
      },
      {
        "x": 0.3669,
        "y": 0.1869
      },
      {
        "x": 0.4529,
        "y": 0.2422
      },
      {
        "x": 0.4935,
        "y": 0.3115
      },
      {
        "x": 0.5,
        "y": 0.3424
      },
      {
        "x": 0.5065,
        "y": 0.3115
      },
      {
        "x": 0.5471,
        "y": 0.2422
      },
      {
        "x": 0.6331,
        "y": 0.1869
      },
      {
        "x": 0.7445,
        "y": 0.1894
      },
      {
        "x": 0.8393,
        "y": 0.2574
      },
      {
        "x": 0.8765,
        "y": 0.3659
      },
      {
        "x": 0.8393,
        "y": 0.4823
      },
      {
        "x": 0.7445,
        "y": 0.5894
      },
      {
        "x": 0.6331,
        "y": 0.686
      },
      {
        "x": 0.5471,
        "y": 0.772
      },
      {
        "x": 0.5065,
        "y": 0.8358
      },
      {
        "x": 0.5,
        "y": 0.86
      },
      {
        "x": 0.4935,
        "y": 0.8358
      },
      {
        "x": 0.4529,
        "y": 0.772
      },
      {
        "x": 0.3669,
        "y": 0.686
      },
      {
        "x": 0.2555,
        "y": 0.5894
      },
      {
        "x": 0.1607,
        "y": 0.4823
      }
    ],
    "stepDescriptions": [
      "Cleft start",
      "Broad right lobe",
      "Bottom point",
      "Broad left lobe",
      "Close at cleft"
    ],
    "waypointLabels": [
      "Cleft",
      "Right Lobe",
      "Bottom Tip",
      "Left Lobe",
      "Close"
    ],
    "waypointIndices": [
      0,
      6,
      12,
      18,
      0
    ]
  },
  {
    "key": "crescent_moon",
    "name": "Crescent Moon",
    "icon": "🌙",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Crescent Moon",
    "points": [
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.7,
        "y": 0.25
      },
      {
        "x": 0.82,
        "y": 0.5
      },
      {
        "x": 0.7,
        "y": 0.75
      },
      {
        "x": 0.5,
        "y": 0.82
      },
      {
        "x": 0.6,
        "y": 0.7
      },
      {
        "x": 0.66,
        "y": 0.5
      },
      {
        "x": 0.6,
        "y": 0.3
      }
    ],
    "stepDescriptions": [
      "Top tip start",
      "Outer curve around to Bottom tip",
      "Scooped inner curve back up to Top tip"
    ],
    "waypointLabels": [
      "Top Tip",
      "Outer Mid",
      "Bottom Tip",
      "Inner Mid",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      0
    ]
  },
  {
    "key": "arrow_right",
    "name": "Right Arrow",
    "icon": "➤",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Right Navigation Arrow",
    "points": [
      {
        "x": 0.2,
        "y": 0.38
      },
      {
        "x": 0.55,
        "y": 0.38
      },
      {
        "x": 0.55,
        "y": 0.22
      },
      {
        "x": 0.85,
        "y": 0.5
      },
      {
        "x": 0.55,
        "y": 0.78
      },
      {
        "x": 0.55,
        "y": 0.62
      },
      {
        "x": 0.2,
        "y": 0.62
      }
    ],
    "stepDescriptions": [
      "Tail top start",
      "Shaft top to Barb",
      "Up to Barb top",
      "Down to Arrow tip",
      "Down to Barb bot",
      "In to Shaft bot",
      "Tail base to close"
    ],
    "waypointLabels": [
      "Tail Top",
      "Barb Corner",
      "Barb Top",
      "Arrow Tip",
      "Barb Bot",
      "Shaft Corner",
      "Close"
    ]
  },
  {
    "key": "arrow_left",
    "name": "Left Arrow",
    "icon": "◀",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Left Navigation Arrow",
    "points": [
      {
        "x": 0.8,
        "y": 0.38
      },
      {
        "x": 0.45,
        "y": 0.38
      },
      {
        "x": 0.45,
        "y": 0.22
      },
      {
        "x": 0.15,
        "y": 0.5
      },
      {
        "x": 0.45,
        "y": 0.78
      },
      {
        "x": 0.45,
        "y": 0.62
      },
      {
        "x": 0.8,
        "y": 0.62
      }
    ],
    "stepDescriptions": [
      "Tail top start",
      "Shaft to Barb",
      "Up to Barb top",
      "Left to Arrow tip",
      "Barb bot",
      "Shaft bot",
      "Close tail"
    ],
    "waypointLabels": [
      "Tail Top",
      "Barb Corner",
      "Barb Top",
      "Arrow Tip",
      "Barb Bot",
      "Shaft Corner",
      "Close"
    ]
  },
  {
    "key": "arrow_up",
    "name": "Up Arrow",
    "icon": "⬆️",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Upward Navigation Arrow",
    "points": [
      {
        "x": 0.38,
        "y": 0.8
      },
      {
        "x": 0.38,
        "y": 0.45
      },
      {
        "x": 0.22,
        "y": 0.45
      },
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.78,
        "y": 0.45
      },
      {
        "x": 0.62,
        "y": 0.45
      },
      {
        "x": 0.62,
        "y": 0.8
      }
    ],
    "stepDescriptions": [
      "Tail left start",
      "Up shaft to Barb",
      "Out to Barb left",
      "Up to Arrow tip",
      "Down to Barb right",
      "In to Shaft right",
      "Tail base to close"
    ],
    "waypointLabels": [
      "Tail Left",
      "Barb Left",
      "Barb Wing",
      "Tip",
      "Right Wing",
      "Shaft Right",
      "Close"
    ]
  },
  {
    "key": "arrow_down",
    "name": "Down Arrow",
    "icon": "⬇️",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Downward Navigation Arrow",
    "points": [
      {
        "x": 0.38,
        "y": 0.2
      },
      {
        "x": 0.38,
        "y": 0.55
      },
      {
        "x": 0.22,
        "y": 0.55
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.78,
        "y": 0.55
      },
      {
        "x": 0.62,
        "y": 0.55
      },
      {
        "x": 0.62,
        "y": 0.2
      }
    ],
    "stepDescriptions": [
      "Tail left start",
      "Down shaft to Barb",
      "Out to Barb left",
      "Down to Arrow tip",
      "Up to Barb right",
      "In to Shaft right",
      "Tail base to close"
    ],
    "waypointLabels": [
      "Tail Left",
      "Barb Left",
      "Barb Wing",
      "Tip",
      "Right Wing",
      "Shaft Right",
      "Close"
    ]
  },
  {
    "key": "shield_kite",
    "name": "Kite Shield",
    "icon": "🛡️",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Heraldic Kite Shield",
    "points": [
      {
        "x": 0.2,
        "y": 0.2
      },
      {
        "x": 0.8,
        "y": 0.2
      },
      {
        "x": 0.8,
        "y": 0.55
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.2,
        "y": 0.55
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Flat top rim to Right",
      "Right wall down to curved bevel",
      "Bottom point",
      "Left wall up",
      "Close at Top-Left"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Right Wall",
      "Bottom Tip",
      "Left Wall",
      "Close"
    ]
  },
  {
    "key": "hourglass_geom",
    "name": "Hourglass",
    "icon": "⏳",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Geometric Hourglass",
    "points": [
      {
        "x": 0.2,
        "y": 0.2
      },
      {
        "x": 0.8,
        "y": 0.2
      },
      {
        "x": 0.52,
        "y": 0.5
      },
      {
        "x": 0.8,
        "y": 0.8
      },
      {
        "x": 0.2,
        "y": 0.8
      },
      {
        "x": 0.48,
        "y": 0.5
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Top rim to Right",
      "Slant down to Center waist",
      "Slant down to Bottom-Right base",
      "Bottom base to Left",
      "Slant up through Center waist to close"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Center Waist",
      "Bottom-Right",
      "Bottom-Left",
      "Center Neck",
      "Close"
    ]
  },
  {
    "key": "envelope_letter",
    "name": "Envelope",
    "icon": "✉️",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Postal Envelope",
    "points": [
      {
        "x": 0.2,
        "y": 0.3
      },
      {
        "x": 0.8,
        "y": 0.3
      },
      {
        "x": 0.8,
        "y": 0.75
      },
      {
        "x": 0.2,
        "y": 0.75
      }
    ],
    "stepDescriptions": [
      "Top-Left start",
      "Top flap rim",
      "Down Right side",
      "Bottom rim to Left",
      "Up Left side to close"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Bottom-Right",
      "Bottom-Left",
      "Close"
    ]
  },
  {
    "key": "bell_contour",
    "name": "Liberty Bell",
    "icon": "🔔",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Bell Silhouette",
    "points": [
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.62,
        "y": 0.25
      },
      {
        "x": 0.65,
        "y": 0.65
      },
      {
        "x": 0.82,
        "y": 0.75
      },
      {
        "x": 0.18,
        "y": 0.75
      },
      {
        "x": 0.35,
        "y": 0.65
      },
      {
        "x": 0.38,
        "y": 0.25
      }
    ],
    "stepDescriptions": [
      "Bell crown start",
      "Right shoulder",
      "Right body down",
      "Right lip flare",
      "Bottom rim to Left lip",
      "Left body up",
      "Left shoulder to close"
    ],
    "waypointLabels": [
      "Crown",
      "Right Shoulder",
      "Right Waist",
      "Right Lip",
      "Left Lip",
      "Left Waist",
      "Left Shoulder",
      "Close"
    ]
  },
  {
    "key": "lightning_bolt",
    "name": "Lightning Bolt",
    "icon": "⚡",
    "tier": 2,
    "difficulty": "Medium",
    "description": "High Voltage Lightning",
    "points": [
      {
        "x": 0.55,
        "y": 0.15
      },
      {
        "x": 0.32,
        "y": 0.48
      },
      {
        "x": 0.48,
        "y": 0.48
      },
      {
        "x": 0.35,
        "y": 0.85
      },
      {
        "x": 0.68,
        "y": 0.48
      },
      {
        "x": 0.52,
        "y": 0.48
      }
    ],
    "stepDescriptions": [
      "Top peak start",
      "Zig-zag down to left mid",
      "Notch step to right",
      "Down to sharp bottom tip",
      "Zig-zag up to right mid",
      "Notch step left to close"
    ],
    "waypointLabels": [
      "Top Peak",
      "Left Mid",
      "Notch Step",
      "Bottom Tip",
      "Right Mid",
      "Return Notch",
      "Close"
    ]
  },
  {
    "key": "coffee_mug",
    "name": "Coffee Cup",
    "icon": "☕",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Coffee Mug Basin",
    "points": [
      {
        "x": 0.22,
        "y": 0.3
      },
      {
        "x": 0.7,
        "y": 0.3
      },
      {
        "x": 0.65,
        "y": 0.75
      },
      {
        "x": 0.27,
        "y": 0.75
      }
    ],
    "stepDescriptions": [
      "Cup rim left",
      "Cup rim right",
      "Down to bottom right",
      "Flat base to left",
      "Up to rim left"
    ],
    "waypointLabels": [
      "Rim Left",
      "Rim Right",
      "Base Right",
      "Base Left",
      "Close"
    ]
  },
  {
    "key": "letter_a",
    "name": "Letter A Silhouette",
    "icon": "🅰️",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Letter A Glyph",
    "points": [
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.8,
        "y": 0.82
      },
      {
        "x": 0.62,
        "y": 0.82
      },
      {
        "x": 0.55,
        "y": 0.62
      },
      {
        "x": 0.45,
        "y": 0.62
      },
      {
        "x": 0.38,
        "y": 0.82
      },
      {
        "x": 0.2,
        "y": 0.82
      }
    ],
    "stepDescriptions": [
      "Apex peak start",
      "Down right leg",
      "Right foot",
      "Up to crossbar right",
      "Across to crossbar left",
      "Down to left foot",
      "Up left leg to close"
    ],
    "waypointLabels": [
      "Apex",
      "Right Foot",
      "Foot In",
      "Bar Right",
      "Bar Left",
      "Left Foot",
      "Close"
    ]
  },
  {
    "key": "letter_c",
    "name": "Letter C Arc",
    "icon": "🅲",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Block Letter C",
    "points": [
      {
        "x": 0.75,
        "y": 0.28
      },
      {
        "x": 0.45,
        "y": 0.2
      },
      {
        "x": 0.22,
        "y": 0.5
      },
      {
        "x": 0.45,
        "y": 0.8
      },
      {
        "x": 0.75,
        "y": 0.72
      },
      {
        "x": 0.65,
        "y": 0.62
      },
      {
        "x": 0.45,
        "y": 0.68
      },
      {
        "x": 0.35,
        "y": 0.5
      },
      {
        "x": 0.45,
        "y": 0.32
      },
      {
        "x": 0.65,
        "y": 0.38
      }
    ],
    "stepDescriptions": [
      "Top tip",
      "Top curve",
      "Left spine",
      "Bottom curve",
      "Bottom tip",
      "Inner bottom",
      "Inner spine",
      "Inner top",
      "Close"
    ],
    "waypointLabels": [
      "Top Tip",
      "Top Arc",
      "Spine",
      "Bot Arc",
      "Bot Tip",
      "Inner Bot",
      "Inner Spine",
      "Inner Top",
      "Close"
    ]
  },
  {
    "key": "letter_z",
    "name": "Letter Z Glyph",
    "icon": "🅩",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Block Letter Z",
    "points": [
      {
        "x": 0.25,
        "y": 0.22
      },
      {
        "x": 0.75,
        "y": 0.22
      },
      {
        "x": 0.75,
        "y": 0.35
      },
      {
        "x": 0.4,
        "y": 0.68
      },
      {
        "x": 0.75,
        "y": 0.68
      },
      {
        "x": 0.75,
        "y": 0.82
      },
      {
        "x": 0.25,
        "y": 0.82
      },
      {
        "x": 0.25,
        "y": 0.68
      },
      {
        "x": 0.6,
        "y": 0.35
      },
      {
        "x": 0.25,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Top-Left",
      "Top bar right",
      "Top bar down",
      "Diagonal down-left",
      "Bottom bar right",
      "Bottom-Right end",
      "Bottom bar left",
      "Bottom-Left step",
      "Diagonal up-right",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
      "Close"
    ]
  },
  {
    "key": "letter_h",
    "name": "Letter H Frame",
    "icon": "🅷",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Block Letter H",
    "points": [
      {
        "x": 0.25,
        "y": 0.2
      },
      {
        "x": 0.4,
        "y": 0.2
      },
      {
        "x": 0.4,
        "y": 0.45
      },
      {
        "x": 0.6,
        "y": 0.45
      },
      {
        "x": 0.6,
        "y": 0.2
      },
      {
        "x": 0.75,
        "y": 0.2
      },
      {
        "x": 0.75,
        "y": 0.8
      },
      {
        "x": 0.6,
        "y": 0.8
      },
      {
        "x": 0.6,
        "y": 0.55
      },
      {
        "x": 0.4,
        "y": 0.55
      },
      {
        "x": 0.4,
        "y": 0.8
      },
      {
        "x": 0.25,
        "y": 0.8
      }
    ],
    "stepDescriptions": [
      "Left pole top-left",
      "Left pole top-right",
      "Crossbar top-left",
      "Crossbar top-right",
      "Right pole top-left",
      "Right pole top-right",
      "Right pole bot-right",
      "Right pole bot-left",
      "Crossbar bot-right",
      "Crossbar bot-left",
      "Left pole bot-right",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
      "P10",
      "P11",
      "Close"
    ]
  },
  {
    "key": "letter_m",
    "name": "Letter M Outline",
    "icon": "🅼",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Block Letter M",
    "points": [
      {
        "x": 0.18,
        "y": 0.8
      },
      {
        "x": 0.18,
        "y": 0.2
      },
      {
        "x": 0.35,
        "y": 0.2
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.65,
        "y": 0.2
      },
      {
        "x": 0.82,
        "y": 0.2
      },
      {
        "x": 0.82,
        "y": 0.8
      },
      {
        "x": 0.68,
        "y": 0.8
      },
      {
        "x": 0.68,
        "y": 0.45
      },
      {
        "x": 0.5,
        "y": 0.7
      },
      {
        "x": 0.32,
        "y": 0.45
      },
      {
        "x": 0.32,
        "y": 0.8
      }
    ],
    "stepDescriptions": [
      "Left foot",
      "Left mast top",
      "Mast head",
      "Central V valley",
      "Right mast head",
      "Right mast top",
      "Right foot",
      "Inner right foot",
      "Inner right slope",
      "Inner central peak",
      "Inner left slope",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P2",
      "P3",
      "Valley",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
      "Peak",
      "P11",
      "Close"
    ]
  },
  {
    "key": "number_zero",
    "name": "Number 0",
    "icon": "0️⃣",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Number 0 Glyph",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.6339,
        "y": 0.1766
      },
      {
        "x": 0.7475,
        "y": 0.2525
      },
      {
        "x": 0.8234,
        "y": 0.3661
      },
      {
        "x": 0.85,
        "y": 0.5
      },
      {
        "x": 0.8234,
        "y": 0.6339
      },
      {
        "x": 0.7475,
        "y": 0.7475
      },
      {
        "x": 0.6339,
        "y": 0.8234
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.3661,
        "y": 0.8234
      },
      {
        "x": 0.2525,
        "y": 0.7475
      },
      {
        "x": 0.1766,
        "y": 0.6339
      },
      {
        "x": 0.15,
        "y": 0.5
      },
      {
        "x": 0.1766,
        "y": 0.3661
      },
      {
        "x": 0.2525,
        "y": 0.2525
      },
      {
        "x": 0.3661,
        "y": 0.1766
      }
    ],
    "stepDescriptions": [
      "Top start",
      "Curve right side",
      "Bottom curve",
      "Left curve",
      "Close at top"
    ],
    "waypointLabels": [
      "Top",
      "Right",
      "Bottom",
      "Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      0
    ]
  },
  {
    "key": "number_seven",
    "name": "Number 7",
    "icon": "7️⃣",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Number 7 Glyph",
    "points": [
      {
        "x": 0.2,
        "y": 0.22
      },
      {
        "x": 0.8,
        "y": 0.22
      },
      {
        "x": 0.8,
        "y": 0.35
      },
      {
        "x": 0.5,
        "y": 0.82
      },
      {
        "x": 0.35,
        "y": 0.82
      },
      {
        "x": 0.62,
        "y": 0.35
      },
      {
        "x": 0.2,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Top bar left",
      "Top bar right",
      "Right corner drop",
      "Slanted stem to ground",
      "Stem foot",
      "Inner diagonal up",
      "Close top bar"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Corner",
      "Foot Right",
      "Foot Left",
      "Inner Stem",
      "Close"
    ]
  },
  {
    "key": "number_one",
    "name": "Number 1",
    "icon": "1️⃣",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Number 1 Serif",
    "points": [
      {
        "x": 0.35,
        "y": 0.35
      },
      {
        "x": 0.5,
        "y": 0.2
      },
      {
        "x": 0.6,
        "y": 0.2
      },
      {
        "x": 0.6,
        "y": 0.75
      },
      {
        "x": 0.72,
        "y": 0.75
      },
      {
        "x": 0.72,
        "y": 0.85
      },
      {
        "x": 0.28,
        "y": 0.85
      },
      {
        "x": 0.28,
        "y": 0.75
      },
      {
        "x": 0.45,
        "y": 0.75
      },
      {
        "x": 0.45,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Beak start",
      "Peak top-left",
      "Stem top-right",
      "Stem down to base",
      "Base foot right",
      "Ground right",
      "Ground left",
      "Base foot left",
      "Stem base left",
      "Close at beak"
    ],
    "waypointLabels": [
      "Beak",
      "Peak",
      "Stem Top",
      "Base Right",
      "Ground Right",
      "Ground Left",
      "Base Left",
      "Stem Bot",
      "Inner Beak",
      "Close"
    ]
  },
  {
    "key": "fish_silhouette",
    "name": "Tropical Fish",
    "icon": "🐟",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Fish Silhouette",
    "points": [
      {
        "x": 0.2,
        "y": 0.5
      },
      {
        "x": 0.4,
        "y": 0.28
      },
      {
        "x": 0.68,
        "y": 0.4
      },
      {
        "x": 0.85,
        "y": 0.25
      },
      {
        "x": 0.78,
        "y": 0.5
      },
      {
        "x": 0.85,
        "y": 0.75
      },
      {
        "x": 0.68,
        "y": 0.6
      },
      {
        "x": 0.4,
        "y": 0.72
      }
    ],
    "stepDescriptions": [
      "Nose tip start",
      "Top dorsal curve",
      "Tail waist top",
      "Tail fin top corner",
      "Tail cleft",
      "Tail fin bottom corner",
      "Tail waist bottom",
      "Bottom belly curve to nose"
    ],
    "waypointLabels": [
      "Nose",
      "Dorsal",
      "Tail Waist",
      "Fin Top",
      "Fin Cleft",
      "Fin Bot",
      "Tail Belly",
      "Close"
    ]
  },
  {
    "key": "gem_cut",
    "name": "Brilliant Gem",
    "icon": "💎",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Faceted Gemstone",
    "points": [
      {
        "x": 0.3,
        "y": 0.25
      },
      {
        "x": 0.7,
        "y": 0.25
      },
      {
        "x": 0.85,
        "y": 0.42
      },
      {
        "x": 0.5,
        "y": 0.82
      },
      {
        "x": 0.15,
        "y": 0.42
      }
    ],
    "stepDescriptions": [
      "Table top-left",
      "Table top-right",
      "Crown facet right",
      "Culet bottom tip",
      "Crown facet left to close"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top-Right",
      "Crown Right",
      "Culet Tip",
      "Crown Left",
      "Close"
    ]
  },
  {
    "key": "cloud_puffy",
    "name": "Puffy Cloud",
    "icon": "☁️",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Fluffy Cloud",
    "points": [
      {
        "x": 0.2,
        "y": 0.65
      },
      {
        "x": 0.15,
        "y": 0.5
      },
      {
        "x": 0.3,
        "y": 0.32
      },
      {
        "x": 0.5,
        "y": 0.25
      },
      {
        "x": 0.7,
        "y": 0.32
      },
      {
        "x": 0.85,
        "y": 0.5
      },
      {
        "x": 0.8,
        "y": 0.65
      }
    ],
    "stepDescriptions": [
      "Base-Left",
      "Left puff",
      "Top-Left puff",
      "Center peak puff",
      "Top-Right puff",
      "Right puff",
      "Base-Right across to close"
    ],
    "waypointLabels": [
      "Start",
      "Puff 1",
      "Puff 2",
      "Peak",
      "Puff 4",
      "Puff 5",
      "Close"
    ]
  },
  {
    "key": "tree_pine",
    "name": "Pine Tree",
    "icon": "🌲",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Evergreen Pine Tree",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.68,
        "y": 0.38
      },
      {
        "x": 0.58,
        "y": 0.38
      },
      {
        "x": 0.75,
        "y": 0.6
      },
      {
        "x": 0.65,
        "y": 0.6
      },
      {
        "x": 0.82,
        "y": 0.78
      },
      {
        "x": 0.55,
        "y": 0.78
      },
      {
        "x": 0.55,
        "y": 0.88
      },
      {
        "x": 0.45,
        "y": 0.88
      },
      {
        "x": 0.45,
        "y": 0.78
      },
      {
        "x": 0.18,
        "y": 0.78
      },
      {
        "x": 0.35,
        "y": 0.6
      },
      {
        "x": 0.25,
        "y": 0.6
      },
      {
        "x": 0.42,
        "y": 0.38
      },
      {
        "x": 0.32,
        "y": 0.38
      }
    ],
    "stepDescriptions": [
      "Top needle",
      "Tier 1 right",
      "Tier 1 shelf",
      "Tier 2 right",
      "Tier 2 shelf",
      "Tier 3 right",
      "Trunk right",
      "Trunk base right",
      "Trunk base left",
      "Trunk left",
      "Tier 3 left",
      "Tier 2 shelf left",
      "Tier 2 left",
      "Tier 1 shelf left",
      "Tier 1 left to close"
    ],
    "waypointLabels": [
      "Peak",
      "T1-R",
      "S1-R",
      "T2-R",
      "S2-R",
      "T3-R",
      "Trunk-R",
      "Base-R",
      "Base-L",
      "Trunk-L",
      "T3-L",
      "S2-L",
      "T2-L",
      "S1-L",
      "T1-L",
      "Close"
    ],
    "waypointIndices": [
      0,
      3,
      6,
      8,
      10,
      13,
      0
    ]
  },
  {
    "key": "star_6pt",
    "name": "6-Point Star",
    "icon": "✡️",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Hexagram 6-Point Star",
    "points": [
      {
        "x": 0.5,
        "y": 0.14
      },
      {
        "x": 0.6,
        "y": 0.3268
      },
      {
        "x": 0.8118,
        "y": 0.32
      },
      {
        "x": 0.7,
        "y": 0.5
      },
      {
        "x": 0.8118,
        "y": 0.68
      },
      {
        "x": 0.6,
        "y": 0.6732
      },
      {
        "x": 0.5,
        "y": 0.86
      },
      {
        "x": 0.4,
        "y": 0.6732
      },
      {
        "x": 0.1882,
        "y": 0.68
      },
      {
        "x": 0.3,
        "y": 0.5
      },
      {
        "x": 0.1882,
        "y": 0.32
      },
      {
        "x": 0.4,
        "y": 0.3268
      }
    ],
    "stepDescriptions": [
      "Top point",
      "Inner 1",
      "Point 2",
      "Inner 2",
      "Point 3",
      "Inner 3",
      "Point 4",
      "Inner 4",
      "Point 5",
      "Inner 5",
      "Point 6",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "I1",
      "P2",
      "I2",
      "P3",
      "I3",
      "P4",
      "I4",
      "P5",
      "I5",
      "P6",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      10,
      0
    ]
  },
  {
    "key": "crown_tri",
    "name": "Simple Crown",
    "icon": "👑",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Triple Peak Crown",
    "points": [
      {
        "x": 0.18,
        "y": 0.72
      },
      {
        "x": 0.2,
        "y": 0.35
      },
      {
        "x": 0.38,
        "y": 0.5
      },
      {
        "x": 0.5,
        "y": 0.28
      },
      {
        "x": 0.62,
        "y": 0.5
      },
      {
        "x": 0.8,
        "y": 0.35
      },
      {
        "x": 0.82,
        "y": 0.72
      }
    ],
    "stepDescriptions": [
      "Base-Left",
      "Left peak",
      "Left valley",
      "Center high peak",
      "Right valley",
      "Right peak",
      "Base-Right across to close"
    ],
    "waypointLabels": [
      "Base-L",
      "Peak 1",
      "Valley 1",
      "Peak 2",
      "Valley 2",
      "Peak 3",
      "Close"
    ]
  },
  {
    "key": "boat_canoe",
    "name": "Sailboat Hull",
    "icon": "⛵",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Boat Hull",
    "points": [
      {
        "x": 0.15,
        "y": 0.55
      },
      {
        "x": 0.85,
        "y": 0.55
      },
      {
        "x": 0.7,
        "y": 0.78
      },
      {
        "x": 0.3,
        "y": 0.78
      }
    ],
    "stepDescriptions": [
      "Bow tip left",
      "Stern tip right",
      "Rudder curve",
      "Keel base to left bow close"
    ],
    "waypointLabels": [
      "Bow",
      "Stern",
      "Keel Right",
      "Keel Left",
      "Close"
    ]
  },
  {
    "key": "infinity_loop",
    "name": "Infinity Symbol",
    "icon": "∞",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Lemniscate Infinity Loop",
    "points": [
      {
        "x": 0.932,
        "y": 0.5
      },
      {
        "x": 0.8911,
        "y": 0.6012
      },
      {
        "x": 0.7993,
        "y": 0.6496
      },
      {
        "x": 0.7036,
        "y": 0.644
      },
      {
        "x": 0.6234,
        "y": 0.6069
      },
      {
        "x": 0.5578,
        "y": 0.5559
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.4422,
        "y": 0.4441
      },
      {
        "x": 0.3766,
        "y": 0.3931
      },
      {
        "x": 0.2964,
        "y": 0.356
      },
      {
        "x": 0.2007,
        "y": 0.3504
      },
      {
        "x": 0.1089,
        "y": 0.3988
      },
      {
        "x": 0.068,
        "y": 0.5
      },
      {
        "x": 0.1089,
        "y": 0.6012
      },
      {
        "x": 0.2007,
        "y": 0.6496
      },
      {
        "x": 0.2964,
        "y": 0.644
      },
      {
        "x": 0.3766,
        "y": 0.6069
      },
      {
        "x": 0.4422,
        "y": 0.5559
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.5578,
        "y": 0.4441
      },
      {
        "x": 0.6234,
        "y": 0.3931
      },
      {
        "x": 0.7036,
        "y": 0.356
      },
      {
        "x": 0.7993,
        "y": 0.3504
      },
      {
        "x": 0.8911,
        "y": 0.3988
      }
    ],
    "stepDescriptions": [
      "Center crossover start",
      "Loop around Right lobe",
      "Cross back through Center",
      "Loop around Left lobe",
      "Close at Center"
    ],
    "waypointLabels": [
      "Center",
      "Right Lobe",
      "Center Return",
      "Left Lobe",
      "Close"
    ],
    "waypointIndices": [
      0,
      6,
      12,
      18,
      0
    ]
  },
  {
    "key": "star_8pt",
    "name": "8-Point Star",
    "icon": "✳️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Octagram 8-Point Star",
    "points": [
      {
        "x": 0.5,
        "y": 0.14
      },
      {
        "x": 0.5689,
        "y": 0.3337
      },
      {
        "x": 0.7546,
        "y": 0.2454
      },
      {
        "x": 0.6663,
        "y": 0.4311
      },
      {
        "x": 0.86,
        "y": 0.5
      },
      {
        "x": 0.6663,
        "y": 0.5689
      },
      {
        "x": 0.7546,
        "y": 0.7546
      },
      {
        "x": 0.5689,
        "y": 0.6663
      },
      {
        "x": 0.5,
        "y": 0.86
      },
      {
        "x": 0.4311,
        "y": 0.6663
      },
      {
        "x": 0.2454,
        "y": 0.7546
      },
      {
        "x": 0.3337,
        "y": 0.5689
      },
      {
        "x": 0.14,
        "y": 0.5
      },
      {
        "x": 0.3337,
        "y": 0.4311
      },
      {
        "x": 0.2454,
        "y": 0.2454
      },
      {
        "x": 0.4311,
        "y": 0.3337
      }
    ],
    "stepDescriptions": [
      "Top point",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "Close"
    ],
    "waypointLabels": [
      "Top",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      10,
      12,
      14,
      0
    ]
  },
  {
    "key": "cross_maltese",
    "name": "Maltese Cross",
    "icon": "🎖️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Maltese Knights Cross",
    "points": [
      {
        "x": 0.5,
        "y": 0.35
      },
      {
        "x": 0.35,
        "y": 0.18
      },
      {
        "x": 0.5,
        "y": 0.25
      },
      {
        "x": 0.65,
        "y": 0.18
      },
      {
        "x": 0.5,
        "y": 0.35
      },
      {
        "x": 0.65,
        "y": 0.35
      },
      {
        "x": 0.82,
        "y": 0.35
      },
      {
        "x": 0.75,
        "y": 0.5
      },
      {
        "x": 0.82,
        "y": 0.65
      },
      {
        "x": 0.5,
        "y": 0.65
      },
      {
        "x": 0.65,
        "y": 0.82
      },
      {
        "x": 0.5,
        "y": 0.75
      },
      {
        "x": 0.35,
        "y": 0.82
      },
      {
        "x": 0.5,
        "y": 0.65
      },
      {
        "x": 0.35,
        "y": 0.65
      },
      {
        "x": 0.18,
        "y": 0.65
      },
      {
        "x": 0.25,
        "y": 0.5
      },
      {
        "x": 0.18,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Center top notch",
      "Top arrowhead",
      "Top notch",
      "Right arrowhead",
      "Right notch",
      "Bottom arrowhead",
      "Bottom notch",
      "Left arrowhead",
      "Close"
    ],
    "waypointLabels": [
      "C1",
      "Arrow Top",
      "C2",
      "Arrow Right",
      "C3",
      "Arrow Bot",
      "C4",
      "Arrow Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      6,
      10,
      14,
      0
    ]
  },
  {
    "key": "crown_royal",
    "name": "Royal 5-Peak Crown",
    "icon": "👑",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Five-Peak Royal Diadem",
    "points": [
      {
        "x": 0.15,
        "y": 0.75
      },
      {
        "x": 0.18,
        "y": 0.38
      },
      {
        "x": 0.32,
        "y": 0.52
      },
      {
        "x": 0.42,
        "y": 0.32
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.58,
        "y": 0.32
      },
      {
        "x": 0.68,
        "y": 0.52
      },
      {
        "x": 0.82,
        "y": 0.38
      },
      {
        "x": 0.85,
        "y": 0.75
      }
    ],
    "stepDescriptions": [
      "Base-Left",
      "Peak 1",
      "Valley 1",
      "Peak 2",
      "Center valley",
      "Peak 3",
      "Valley 3",
      "Peak 4",
      "Base-Right across to close"
    ],
    "waypointLabels": [
      "Base-L",
      "Peak 1",
      "Valley 1",
      "Peak 2",
      "Center Valley",
      "Peak 3",
      "Valley 3",
      "Peak 4",
      "Close"
    ]
  },
  {
    "key": "butterfly_geom",
    "name": "Geometric Butterfly",
    "icon": "🦋",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Butterfly Silhouette",
    "points": [
      {
        "x": 0.5,
        "y": 0.3
      },
      {
        "x": 0.75,
        "y": 0.15
      },
      {
        "x": 0.85,
        "y": 0.42
      },
      {
        "x": 0.55,
        "y": 0.5
      },
      {
        "x": 0.8,
        "y": 0.75
      },
      {
        "x": 0.55,
        "y": 0.72
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.45,
        "y": 0.72
      },
      {
        "x": 0.2,
        "y": 0.75
      },
      {
        "x": 0.45,
        "y": 0.5
      },
      {
        "x": 0.15,
        "y": 0.42
      },
      {
        "x": 0.25,
        "y": 0.15
      }
    ],
    "stepDescriptions": [
      "Head apex",
      "Right upper wing top",
      "Right upper wing tip",
      "Waist right",
      "Right lower wing tip",
      "Lower body right",
      "Tail bottom",
      "Lower body left",
      "Left lower wing tip",
      "Waist left",
      "Left upper wing tip",
      "Left upper wing top to close"
    ],
    "waypointLabels": [
      "Head",
      "R-Wing-Top",
      "R-Wing-Tip",
      "R-Waist",
      "R-Low-Wing",
      "Tail",
      "L-Low-Wing",
      "L-Waist",
      "L-Wing-Tip",
      "L-Wing-Top",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      10,
      0
    ]
  },
  {
    "key": "shield_heater",
    "name": "Medieval Heater Shield",
    "icon": "🛡️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Chivalric Heater Shield",
    "points": [
      {
        "x": 0.2,
        "y": 0.2
      },
      {
        "x": 0.5,
        "y": 0.25
      },
      {
        "x": 0.8,
        "y": 0.2
      },
      {
        "x": 0.82,
        "y": 0.55
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.18,
        "y": 0.55
      }
    ],
    "stepDescriptions": [
      "Top-Left",
      "Top center dip",
      "Top-Right corner",
      "Right flank curve",
      "Bottom pointed spike",
      "Left flank curve to close"
    ],
    "waypointLabels": [
      "Top-Left",
      "Top Dip",
      "Top-Right",
      "Right Flank",
      "Spike Tip",
      "Left Flank",
      "Close"
    ]
  },
  {
    "key": "sword_broad",
    "name": "Broadsword",
    "icon": "🗡️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Medieval Knight Sword",
    "points": [
      {
        "x": 0.5,
        "y": 0.12
      },
      {
        "x": 0.56,
        "y": 0.22
      },
      {
        "x": 0.56,
        "y": 0.62
      },
      {
        "x": 0.72,
        "y": 0.62
      },
      {
        "x": 0.72,
        "y": 0.68
      },
      {
        "x": 0.54,
        "y": 0.68
      },
      {
        "x": 0.54,
        "y": 0.82
      },
      {
        "x": 0.58,
        "y": 0.84
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.42,
        "y": 0.84
      },
      {
        "x": 0.46,
        "y": 0.82
      },
      {
        "x": 0.46,
        "y": 0.68
      },
      {
        "x": 0.28,
        "y": 0.68
      },
      {
        "x": 0.28,
        "y": 0.62
      },
      {
        "x": 0.44,
        "y": 0.62
      },
      {
        "x": 0.44,
        "y": 0.22
      }
    ],
    "stepDescriptions": [
      "Blade tip",
      "Right blade bevel",
      "Right fuller down",
      "Crossguard right tip",
      "Crossguard right bot",
      "Grip top right",
      "Pommel right",
      "Pommel tip",
      "Pommel left",
      "Grip left",
      "Crossguard left bot",
      "Crossguard left tip",
      "Left fuller up",
      "Left blade bevel to close"
    ],
    "waypointLabels": [
      "Tip",
      "Right Blade",
      "Crossguard-R",
      "Pommel",
      "Crossguard-L",
      "Left Blade",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      8,
      12,
      14,
      0
    ]
  },
  {
    "key": "key_skeleton",
    "name": "Skeleton Key",
    "icon": "🗝️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Antique Skeleton Key",
    "points": [
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.65,
        "y": 0.24
      },
      {
        "x": 0.65,
        "y": 0.38
      },
      {
        "x": 0.55,
        "y": 0.44
      },
      {
        "x": 0.55,
        "y": 0.68
      },
      {
        "x": 0.72,
        "y": 0.68
      },
      {
        "x": 0.72,
        "y": 0.75
      },
      {
        "x": 0.6,
        "y": 0.75
      },
      {
        "x": 0.72,
        "y": 0.82
      },
      {
        "x": 0.72,
        "y": 0.88
      },
      {
        "x": 0.45,
        "y": 0.88
      },
      {
        "x": 0.45,
        "y": 0.44
      },
      {
        "x": 0.35,
        "y": 0.38
      },
      {
        "x": 0.35,
        "y": 0.24
      }
    ],
    "stepDescriptions": [
      "Bow ring top",
      "Bow right",
      "Bow bottom right",
      "Shaft right",
      "Bit tooth 1 right",
      "Bit gap",
      "Bit tooth 2 right",
      "Bit base",
      "Shaft left",
      "Bow bottom left",
      "Bow left to close"
    ],
    "waypointLabels": [
      "Bow Top",
      "Bow Right",
      "Shaft Top",
      "Bit Top",
      "Bit Bot",
      "Shaft Base",
      "Bow Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      9,
      12,
      0
    ]
  },
  {
    "key": "anchor_nautical",
    "name": "Ship Anchor",
    "icon": "⚓",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Nautical Anchor",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.58,
        "y": 0.2
      },
      {
        "x": 0.58,
        "y": 0.28
      },
      {
        "x": 0.78,
        "y": 0.28
      },
      {
        "x": 0.78,
        "y": 0.34
      },
      {
        "x": 0.56,
        "y": 0.34
      },
      {
        "x": 0.56,
        "y": 0.65
      },
      {
        "x": 0.82,
        "y": 0.55
      },
      {
        "x": 0.85,
        "y": 0.65
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.15,
        "y": 0.65
      },
      {
        "x": 0.18,
        "y": 0.55
      },
      {
        "x": 0.44,
        "y": 0.65
      },
      {
        "x": 0.44,
        "y": 0.34
      },
      {
        "x": 0.22,
        "y": 0.34
      },
      {
        "x": 0.22,
        "y": 0.28
      },
      {
        "x": 0.42,
        "y": 0.28
      },
      {
        "x": 0.42,
        "y": 0.2
      }
    ],
    "stepDescriptions": [
      "Ring top",
      "Crossbeam right",
      "Shaft down",
      "Right fluke tip",
      "Crown bottom",
      "Left fluke tip",
      "Shaft up",
      "Crossbeam left",
      "Close"
    ],
    "waypointLabels": [
      "Ring",
      "Beam Right",
      "Right Fluke",
      "Crown Bot",
      "Left Fluke",
      "Beam Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      3,
      7,
      9,
      11,
      15,
      0
    ]
  },
  {
    "key": "castle_tower",
    "name": "Castle Fortress",
    "icon": "🏰",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Fortress Crenellations",
    "points": [
      {
        "x": 0.22,
        "y": 0.82
      },
      {
        "x": 0.22,
        "y": 0.35
      },
      {
        "x": 0.32,
        "y": 0.35
      },
      {
        "x": 0.32,
        "y": 0.45
      },
      {
        "x": 0.44,
        "y": 0.45
      },
      {
        "x": 0.44,
        "y": 0.35
      },
      {
        "x": 0.56,
        "y": 0.35
      },
      {
        "x": 0.56,
        "y": 0.45
      },
      {
        "x": 0.68,
        "y": 0.45
      },
      {
        "x": 0.68,
        "y": 0.35
      },
      {
        "x": 0.78,
        "y": 0.35
      },
      {
        "x": 0.78,
        "y": 0.82
      }
    ],
    "stepDescriptions": [
      "Base-Left",
      "Left wall up",
      "Merlon 1",
      "Embrasure 1",
      "Merlon 2",
      "Embrasure 2",
      "Merlon 3",
      "Right wall down to base across to close"
    ],
    "waypointLabels": [
      "Base-L",
      "Wall-L",
      "Merlon 1",
      "Merlon 2",
      "Merlon 3",
      "Wall-R",
      "Close"
    ]
  },
  {
    "key": "clover_four",
    "name": "Four-Leaf Clover",
    "icon": "🍀",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Lucky 4-Leaf Clover",
    "points": [
      {
        "x": 0.5,
        "y": 0.45
      },
      {
        "x": 0.35,
        "y": 0.32
      },
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.65,
        "y": 0.32
      },
      {
        "x": 0.55,
        "y": 0.5
      },
      {
        "x": 0.68,
        "y": 0.35
      },
      {
        "x": 0.82,
        "y": 0.5
      },
      {
        "x": 0.68,
        "y": 0.65
      },
      {
        "x": 0.5,
        "y": 0.55
      },
      {
        "x": 0.65,
        "y": 0.68
      },
      {
        "x": 0.5,
        "y": 0.82
      },
      {
        "x": 0.35,
        "y": 0.68
      },
      {
        "x": 0.45,
        "y": 0.5
      },
      {
        "x": 0.32,
        "y": 0.65
      },
      {
        "x": 0.18,
        "y": 0.5
      },
      {
        "x": 0.32,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Center top",
      "Leaf 1 apex",
      "Center right",
      "Leaf 2 apex",
      "Center bot",
      "Leaf 3 apex",
      "Center left",
      "Leaf 4 apex to close"
    ],
    "waypointLabels": [
      "Center",
      "Leaf 1",
      "Leaf 2",
      "Leaf 3",
      "Leaf 4",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      6,
      10,
      14,
      0
    ]
  },
  {
    "key": "starburst_badge",
    "name": "12-Point Badge",
    "icon": "🏵️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Rosette Starburst Badge",
    "points": [
      {
        "x": 0.5,
        "y": 0.14
      },
      {
        "x": 0.5673,
        "y": 0.2489
      },
      {
        "x": 0.68,
        "y": 0.1882
      },
      {
        "x": 0.6838,
        "y": 0.3162
      },
      {
        "x": 0.8118,
        "y": 0.32
      },
      {
        "x": 0.7511,
        "y": 0.4327
      },
      {
        "x": 0.86,
        "y": 0.5
      },
      {
        "x": 0.7511,
        "y": 0.5673
      },
      {
        "x": 0.8118,
        "y": 0.68
      },
      {
        "x": 0.6838,
        "y": 0.6838
      },
      {
        "x": 0.68,
        "y": 0.8118
      },
      {
        "x": 0.5673,
        "y": 0.7511
      },
      {
        "x": 0.5,
        "y": 0.86
      },
      {
        "x": 0.4327,
        "y": 0.7511
      },
      {
        "x": 0.32,
        "y": 0.8118
      },
      {
        "x": 0.3162,
        "y": 0.6838
      },
      {
        "x": 0.1882,
        "y": 0.68
      },
      {
        "x": 0.2489,
        "y": 0.5673
      },
      {
        "x": 0.14,
        "y": 0.5
      },
      {
        "x": 0.2489,
        "y": 0.4327
      },
      {
        "x": 0.1882,
        "y": 0.32
      },
      {
        "x": 0.3162,
        "y": 0.3162
      },
      {
        "x": 0.32,
        "y": 0.1882
      },
      {
        "x": 0.4327,
        "y": 0.2489
      }
    ],
    "stepDescriptions": [
      "Top point",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
      "P10",
      "P11",
      "P12",
      "Close"
    ],
    "waypointLabels": [
      "Top",
      "P3",
      "P5",
      "P7",
      "P9",
      "P11",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      16,
      20,
      0
    ]
  },
  {
    "key": "tulip_flower",
    "name": "Spring Tulip",
    "icon": "🌷",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Blooming Tulip Cup",
    "points": [
      {
        "x": 0.5,
        "y": 0.25
      },
      {
        "x": 0.62,
        "y": 0.38
      },
      {
        "x": 0.75,
        "y": 0.28
      },
      {
        "x": 0.68,
        "y": 0.65
      },
      {
        "x": 0.5,
        "y": 0.78
      },
      {
        "x": 0.32,
        "y": 0.65
      },
      {
        "x": 0.25,
        "y": 0.28
      },
      {
        "x": 0.38,
        "y": 0.38
      }
    ],
    "stepDescriptions": [
      "Center petal peak",
      "Center right valley",
      "Right petal tip",
      "Right cup base",
      "Stem bottom",
      "Left cup base",
      "Left petal tip",
      "Center left valley to close"
    ],
    "waypointLabels": [
      "Center Petal",
      "Valley Right",
      "Petal Right",
      "Cup Base",
      "Petal Left",
      "Valley Left",
      "Close"
    ]
  },
  {
    "key": "diamond_ring",
    "name": "Diamond Ring",
    "icon": "💍",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Diamond Solitaire Ring",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.62,
        "y": 0.22
      },
      {
        "x": 0.56,
        "y": 0.3
      },
      {
        "x": 0.72,
        "y": 0.45
      },
      {
        "x": 0.72,
        "y": 0.72
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.28,
        "y": 0.72
      },
      {
        "x": 0.28,
        "y": 0.45
      },
      {
        "x": 0.44,
        "y": 0.3
      },
      {
        "x": 0.38,
        "y": 0.22
      }
    ],
    "stepDescriptions": [
      "Gem peak",
      "Gem facet right",
      "Ring band right top",
      "Band right flank",
      "Band bottom",
      "Band left flank",
      "Ring band left top",
      "Gem facet left to close"
    ],
    "waypointLabels": [
      "Gem Tip",
      "Facet-R",
      "Band-R",
      "Band Bot",
      "Band-L",
      "Facet-L",
      "Close"
    ]
  },
  {
    "key": "wine_goblet",
    "name": "Chalice Goblet",
    "icon": "🍷",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Royal Wine Chalice",
    "points": [
      {
        "x": 0.25,
        "y": 0.22
      },
      {
        "x": 0.75,
        "y": 0.22
      },
      {
        "x": 0.68,
        "y": 0.52
      },
      {
        "x": 0.53,
        "y": 0.58
      },
      {
        "x": 0.53,
        "y": 0.78
      },
      {
        "x": 0.7,
        "y": 0.82
      },
      {
        "x": 0.3,
        "y": 0.82
      },
      {
        "x": 0.47,
        "y": 0.78
      },
      {
        "x": 0.47,
        "y": 0.58
      },
      {
        "x": 0.32,
        "y": 0.52
      }
    ],
    "stepDescriptions": [
      "Rim left",
      "Rim right",
      "Cup right",
      "Stem top right",
      "Stem bot right",
      "Base right",
      "Base left",
      "Stem bot left",
      "Stem top left",
      "Cup left to close"
    ],
    "waypointLabels": [
      "Rim Left",
      "Rim Right",
      "Bowl Right",
      "Base Right",
      "Base Left",
      "Bowl Left",
      "Close"
    ]
  },
  {
    "key": "airplane_jet",
    "name": "Supersonic Jet",
    "icon": "✈️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Jet Aircraft Silhouette",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.54,
        "y": 0.38
      },
      {
        "x": 0.85,
        "y": 0.52
      },
      {
        "x": 0.85,
        "y": 0.58
      },
      {
        "x": 0.54,
        "y": 0.55
      },
      {
        "x": 0.54,
        "y": 0.75
      },
      {
        "x": 0.68,
        "y": 0.82
      },
      {
        "x": 0.68,
        "y": 0.88
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.32,
        "y": 0.88
      },
      {
        "x": 0.32,
        "y": 0.82
      },
      {
        "x": 0.46,
        "y": 0.75
      },
      {
        "x": 0.46,
        "y": 0.55
      },
      {
        "x": 0.15,
        "y": 0.58
      },
      {
        "x": 0.15,
        "y": 0.52
      },
      {
        "x": 0.46,
        "y": 0.38
      }
    ],
    "stepDescriptions": [
      "Nose cone",
      "Fuselage right",
      "Wing right tip",
      "Wing right trailing",
      "Fuselage waist",
      "Tail right",
      "Rudder right",
      "Engine",
      "Rudder left",
      "Tail left",
      "Wing left trailing",
      "Wing left tip to close"
    ],
    "waypointLabels": [
      "Nose",
      "Wing Right",
      "Fuselage",
      "Tail Right",
      "Engine",
      "Tail Left",
      "Wing Left",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      7,
      9,
      13,
      0
    ]
  },
  {
    "key": "guitar_acoustic",
    "name": "Acoustic Guitar",
    "icon": "🎸",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Acoustic Guitar Body",
    "points": [
      {
        "x": 0.46,
        "y": 0.15
      },
      {
        "x": 0.54,
        "y": 0.15
      },
      {
        "x": 0.54,
        "y": 0.42
      },
      {
        "x": 0.65,
        "y": 0.48
      },
      {
        "x": 0.58,
        "y": 0.58
      },
      {
        "x": 0.72,
        "y": 0.72
      },
      {
        "x": 0.65,
        "y": 0.85
      },
      {
        "x": 0.35,
        "y": 0.85
      },
      {
        "x": 0.28,
        "y": 0.72
      },
      {
        "x": 0.42,
        "y": 0.58
      },
      {
        "x": 0.35,
        "y": 0.48
      },
      {
        "x": 0.46,
        "y": 0.42
      }
    ],
    "stepDescriptions": [
      "Headstock top",
      "Headstock right",
      "Fretboard right",
      "Upper bout right",
      "Waist right",
      "Lower bout right",
      "Base right",
      "Base left",
      "Lower bout left",
      "Waist left",
      "Upper bout left",
      "Fretboard left to close"
    ],
    "waypointLabels": [
      "Headstock",
      "Upper Bout-R",
      "Waist-R",
      "Lower Bout-R",
      "Base",
      "Lower Bout-L",
      "Waist-L",
      "Upper Bout-L",
      "Close"
    ]
  },
  {
    "key": "car_sedan",
    "name": "Classic Automobile",
    "icon": "🚗",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Automobile Profile",
    "points": [
      {
        "x": 0.15,
        "y": 0.65
      },
      {
        "x": 0.25,
        "y": 0.52
      },
      {
        "x": 0.42,
        "y": 0.35
      },
      {
        "x": 0.65,
        "y": 0.35
      },
      {
        "x": 0.78,
        "y": 0.52
      },
      {
        "x": 0.88,
        "y": 0.55
      },
      {
        "x": 0.88,
        "y": 0.68
      },
      {
        "x": 0.78,
        "y": 0.68
      },
      {
        "x": 0.74,
        "y": 0.62
      },
      {
        "x": 0.66,
        "y": 0.62
      },
      {
        "x": 0.62,
        "y": 0.68
      },
      {
        "x": 0.38,
        "y": 0.68
      },
      {
        "x": 0.34,
        "y": 0.62
      },
      {
        "x": 0.26,
        "y": 0.62
      },
      {
        "x": 0.22,
        "y": 0.68
      },
      {
        "x": 0.15,
        "y": 0.68
      }
    ],
    "stepDescriptions": [
      "Front bumper",
      "Hood to windshield",
      "Roof apex",
      "Rear window",
      "Trunk lid",
      "Rear bumper",
      "Rear wheel arch",
      "Chassis floor",
      "Front wheel arch to close"
    ],
    "waypointLabels": [
      "Front Bumper",
      "Hood",
      "Roof",
      "Trunk",
      "Rear Bumper",
      "Chassis",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      11,
      0
    ]
  },
  {
    "key": "rocket_ship",
    "name": "Space Rocket",
    "icon": "🚀",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Space Rocket Silhouette",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.62,
        "y": 0.38
      },
      {
        "x": 0.62,
        "y": 0.65
      },
      {
        "x": 0.78,
        "y": 0.82
      },
      {
        "x": 0.65,
        "y": 0.78
      },
      {
        "x": 0.58,
        "y": 0.85
      },
      {
        "x": 0.42,
        "y": 0.85
      },
      {
        "x": 0.35,
        "y": 0.78
      },
      {
        "x": 0.22,
        "y": 0.82
      },
      {
        "x": 0.38,
        "y": 0.65
      },
      {
        "x": 0.38,
        "y": 0.38
      }
    ],
    "stepDescriptions": [
      "Nose cone",
      "Fuselage right",
      "Right booster fin",
      "Fin nozzle",
      "Engine thruster right",
      "Thruster left",
      "Fin nozzle left",
      "Left booster fin",
      "Fuselage left to close"
    ],
    "waypointLabels": [
      "Nose Cone",
      "Fuselage-R",
      "Fin-R",
      "Thruster-R",
      "Thruster-L",
      "Fin-L",
      "Fuselage-L",
      "Close"
    ]
  },
  {
    "key": "shield_badge",
    "name": "Police Shield Badge",
    "icon": "🛡️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Officer Shield Badge",
    "points": [
      {
        "x": 0.5,
        "y": 0.18
      },
      {
        "x": 0.78,
        "y": 0.22
      },
      {
        "x": 0.85,
        "y": 0.5
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.15,
        "y": 0.5
      },
      {
        "x": 0.22,
        "y": 0.22
      }
    ],
    "stepDescriptions": [
      "Top star point",
      "Top-Right rim",
      "Right flank",
      "Bottom pointed spike",
      "Left flank",
      "Top-Left rim to close"
    ],
    "waypointLabels": [
      "Top Crest",
      "Top-Right",
      "Right Flank",
      "Bottom Tip",
      "Left Flank",
      "Top-Left",
      "Close"
    ]
  },
  {
    "key": "mushroom_fungi",
    "name": "Forest Mushroom",
    "icon": "🍄",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Mushroom Cap and Stem",
    "points": [
      {
        "x": 0.5,
        "y": 0.2
      },
      {
        "x": 0.78,
        "y": 0.35
      },
      {
        "x": 0.85,
        "y": 0.52
      },
      {
        "x": 0.62,
        "y": 0.55
      },
      {
        "x": 0.6,
        "y": 0.82
      },
      {
        "x": 0.4,
        "y": 0.82
      },
      {
        "x": 0.38,
        "y": 0.55
      },
      {
        "x": 0.15,
        "y": 0.52
      },
      {
        "x": 0.22,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Cap dome",
      "Cap right slope",
      "Cap right rim",
      "Stem right neck",
      "Stem right foot",
      "Stem left foot",
      "Stem left neck",
      "Cap left rim",
      "Cap left slope to close"
    ],
    "waypointLabels": [
      "Cap Peak",
      "Cap Right",
      "Stem Neck-R",
      "Foot-R",
      "Foot-L",
      "Stem Neck-L",
      "Cap Left",
      "Close"
    ]
  },
  {
    "key": "apple_fruit",
    "name": "Apple Silhouette",
    "icon": "🍎",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Apple Silhouette",
    "points": [
      {
        "x": 0.5,
        "y": 0.28
      },
      {
        "x": 0.65,
        "y": 0.22
      },
      {
        "x": 0.82,
        "y": 0.4
      },
      {
        "x": 0.78,
        "y": 0.72
      },
      {
        "x": 0.6,
        "y": 0.85
      },
      {
        "x": 0.5,
        "y": 0.8
      },
      {
        "x": 0.4,
        "y": 0.85
      },
      {
        "x": 0.22,
        "y": 0.72
      },
      {
        "x": 0.18,
        "y": 0.4
      },
      {
        "x": 0.35,
        "y": 0.22
      }
    ],
    "stepDescriptions": [
      "Stem cleft",
      "Right shoulder",
      "Right cheek",
      "Right base",
      "Bottom cleft",
      "Left base",
      "Left cheek",
      "Left shoulder to close"
    ],
    "waypointLabels": [
      "Top Cleft",
      "Cheek Right",
      "Base Right",
      "Bottom Cleft",
      "Base Left",
      "Cheek Left",
      "Close"
    ]
  },
  {
    "key": "teardrop_gem",
    "name": "Teardrop Gem",
    "icon": "💧",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Pear Cut Teardrop",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.75,
        "y": 0.55
      },
      {
        "x": 0.7,
        "y": 0.78
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.3,
        "y": 0.78
      },
      {
        "x": 0.25,
        "y": 0.55
      }
    ],
    "stepDescriptions": [
      "Apex point",
      "Right slope to belly",
      "Bottom curve right",
      "Bottom round tip",
      "Bottom curve left",
      "Left slope to apex close"
    ],
    "waypointLabels": [
      "Apex Tip",
      "Right Belly",
      "Bottom Round",
      "Left Belly",
      "Close"
    ]
  },
  {
    "key": "potion_flask",
    "name": "Alchemy Flask",
    "icon": "🧪",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Conical Alchemy Flask",
    "points": [
      {
        "x": 0.44,
        "y": 0.18
      },
      {
        "x": 0.56,
        "y": 0.18
      },
      {
        "x": 0.56,
        "y": 0.38
      },
      {
        "x": 0.8,
        "y": 0.75
      },
      {
        "x": 0.75,
        "y": 0.82
      },
      {
        "x": 0.25,
        "y": 0.82
      },
      {
        "x": 0.2,
        "y": 0.75
      },
      {
        "x": 0.44,
        "y": 0.38
      }
    ],
    "stepDescriptions": [
      "Lip left",
      "Lip right",
      "Neck down right",
      "Flask bulb right",
      "Base right",
      "Base left",
      "Flask bulb left",
      "Neck up left to close"
    ],
    "waypointLabels": [
      "Lip Left",
      "Lip Right",
      "Neck Right",
      "Bulb Right",
      "Base",
      "Bulb Left",
      "Neck Left",
      "Close"
    ]
  },
  {
    "key": "windmill_vane",
    "name": "Windmill Blades",
    "icon": "💨",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Four-Vane Windmill",
    "points": [
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.58,
        "y": 0.25
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.85,
        "y": 0.5
      },
      {
        "x": 0.75,
        "y": 0.58
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.42,
        "y": 0.75
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.15,
        "y": 0.5
      },
      {
        "x": 0.25,
        "y": 0.42
      }
    ],
    "stepDescriptions": [
      "Center hub",
      "Blade 1 top",
      "Blade 2 right",
      "Blade 3 bottom",
      "Blade 4 left to close"
    ],
    "waypointLabels": [
      "Hub",
      "Blade 1",
      "Blade 2",
      "Blade 3",
      "Blade 4",
      "Close"
    ],
    "waypointIndices": [
      0,
      1,
      4,
      7,
      10,
      0
    ]
  },
  {
    "key": "star_10pt",
    "name": "10-Point Star",
    "icon": "🌟",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Decagram 10-Point Star",
    "points": [
      {
        "x": 0.5,
        "y": 0.14
      },
      {
        "x": 0.568,
        "y": 0.2908
      },
      {
        "x": 0.7116,
        "y": 0.2088
      },
      {
        "x": 0.678,
        "y": 0.3707
      },
      {
        "x": 0.8424,
        "y": 0.3888
      },
      {
        "x": 0.72,
        "y": 0.5
      },
      {
        "x": 0.8424,
        "y": 0.6112
      },
      {
        "x": 0.678,
        "y": 0.6293
      },
      {
        "x": 0.7116,
        "y": 0.7912
      },
      {
        "x": 0.568,
        "y": 0.7092
      },
      {
        "x": 0.5,
        "y": 0.86
      },
      {
        "x": 0.432,
        "y": 0.7092
      },
      {
        "x": 0.2884,
        "y": 0.7912
      },
      {
        "x": 0.322,
        "y": 0.6293
      },
      {
        "x": 0.1576,
        "y": 0.6112
      },
      {
        "x": 0.28,
        "y": 0.5
      },
      {
        "x": 0.1576,
        "y": 0.3888
      },
      {
        "x": 0.322,
        "y": 0.3707
      },
      {
        "x": 0.2884,
        "y": 0.2088
      },
      {
        "x": 0.432,
        "y": 0.2908
      }
    ],
    "stepDescriptions": [
      "Top point",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
      "P10",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P3",
      "P5",
      "P7",
      "P9",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      16,
      0
    ]
  },
  {
    "key": "star_12pt",
    "name": "12-Point Radiant Star",
    "icon": "✨",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Dodecagram Radiant Star",
    "points": [
      {
        "x": 0.5,
        "y": 0.12
      },
      {
        "x": 0.5569,
        "y": 0.2875
      },
      {
        "x": 0.69,
        "y": 0.1709
      },
      {
        "x": 0.6556,
        "y": 0.3444
      },
      {
        "x": 0.8291,
        "y": 0.31
      },
      {
        "x": 0.7125,
        "y": 0.4431
      },
      {
        "x": 0.88,
        "y": 0.5
      },
      {
        "x": 0.7125,
        "y": 0.5569
      },
      {
        "x": 0.8291,
        "y": 0.69
      },
      {
        "x": 0.6556,
        "y": 0.6556
      },
      {
        "x": 0.69,
        "y": 0.8291
      },
      {
        "x": 0.5569,
        "y": 0.7125
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.4431,
        "y": 0.7125
      },
      {
        "x": 0.31,
        "y": 0.8291
      },
      {
        "x": 0.3444,
        "y": 0.6556
      },
      {
        "x": 0.1709,
        "y": 0.69
      },
      {
        "x": 0.2875,
        "y": 0.5569
      },
      {
        "x": 0.12,
        "y": 0.5
      },
      {
        "x": 0.2875,
        "y": 0.4431
      },
      {
        "x": 0.1709,
        "y": 0.31
      },
      {
        "x": 0.3444,
        "y": 0.3444
      },
      {
        "x": 0.31,
        "y": 0.1709
      },
      {
        "x": 0.4431,
        "y": 0.2875
      }
    ],
    "stepDescriptions": [
      "Point 1",
      "P3",
      "P5",
      "P7",
      "P9",
      "P11",
      "P13",
      "P15",
      "P17",
      "P19",
      "P21",
      "P23",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P5",
      "P9",
      "P13",
      "P17",
      "P21",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      16,
      20,
      0
    ]
  },
  {
    "key": "lotus_flower",
    "name": "Sacred Lotus",
    "icon": "🪷",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Sacred Lotus Bloom",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.58,
        "y": 0.32
      },
      {
        "x": 0.75,
        "y": 0.25
      },
      {
        "x": 0.7,
        "y": 0.5
      },
      {
        "x": 0.85,
        "y": 0.55
      },
      {
        "x": 0.65,
        "y": 0.75
      },
      {
        "x": 0.5,
        "y": 0.78
      },
      {
        "x": 0.35,
        "y": 0.75
      },
      {
        "x": 0.15,
        "y": 0.55
      },
      {
        "x": 0.3,
        "y": 0.5
      },
      {
        "x": 0.25,
        "y": 0.25
      },
      {
        "x": 0.42,
        "y": 0.32
      }
    ],
    "stepDescriptions": [
      "Central petal apex",
      "Right inner notch",
      "Upper-right petal tip",
      "Mid-right notch",
      "Outer-right petal tip",
      "Bottom right bowl",
      "Lotus stem base",
      "Bottom left bowl",
      "Outer-left petal tip",
      "Mid-left notch",
      "Upper-left petal tip",
      "Left inner notch to close"
    ],
    "waypointLabels": [
      "Center Apex",
      "Petal UR",
      "Petal R",
      "Base-R",
      "Base-L",
      "Petal L",
      "Petal UL",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      10,
      0
    ]
  },
  {
    "key": "snowflake_crystal",
    "name": "Hexagonal Snowflake",
    "icon": "❄️",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Crystalline Ice Snowflake",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.55,
        "y": 0.28
      },
      {
        "x": 0.65,
        "y": 0.22
      },
      {
        "x": 0.58,
        "y": 0.35
      },
      {
        "x": 0.78,
        "y": 0.32
      },
      {
        "x": 0.68,
        "y": 0.44
      },
      {
        "x": 0.85,
        "y": 0.5
      },
      {
        "x": 0.68,
        "y": 0.56
      },
      {
        "x": 0.78,
        "y": 0.68
      },
      {
        "x": 0.58,
        "y": 0.65
      },
      {
        "x": 0.65,
        "y": 0.78
      },
      {
        "x": 0.55,
        "y": 0.72
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.45,
        "y": 0.72
      },
      {
        "x": 0.35,
        "y": 0.78
      },
      {
        "x": 0.42,
        "y": 0.65
      },
      {
        "x": 0.22,
        "y": 0.68
      },
      {
        "x": 0.32,
        "y": 0.56
      },
      {
        "x": 0.15,
        "y": 0.5
      },
      {
        "x": 0.32,
        "y": 0.44
      },
      {
        "x": 0.22,
        "y": 0.32
      },
      {
        "x": 0.42,
        "y": 0.35
      },
      {
        "x": 0.35,
        "y": 0.22
      },
      {
        "x": 0.45,
        "y": 0.28
      }
    ],
    "stepDescriptions": [
      "Branch 1 tip",
      "B1-R barb",
      "Branch 2 tip",
      "B2-R barb",
      "Branch 3 tip",
      "B3-R barb",
      "Branch 4 tip",
      "B4-L barb",
      "Branch 5 tip",
      "B5-L barb",
      "Branch 6 tip to close"
    ],
    "waypointLabels": [
      "B1 Tip",
      "B2 Tip",
      "B3 Tip",
      "B4 Tip",
      "B5 Tip",
      "B6 Tip",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      16,
      20,
      0
    ]
  },
  {
    "key": "constellation_dipper",
    "name": "Big Dipper Constellation",
    "icon": "✨",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Ursa Major Big Dipper",
    "points": [
      {
        "x": 0.18,
        "y": 0.32
      },
      {
        "x": 0.32,
        "y": 0.28
      },
      {
        "x": 0.45,
        "y": 0.42
      },
      {
        "x": 0.58,
        "y": 0.48
      },
      {
        "x": 0.78,
        "y": 0.45
      },
      {
        "x": 0.82,
        "y": 0.72
      },
      {
        "x": 0.62,
        "y": 0.75
      },
      {
        "x": 0.58,
        "y": 0.48
      }
    ],
    "stepDescriptions": [
      "Alkaid (tail tip)",
      "Mizar",
      "Alioth",
      "Megrez (bowl top-left)",
      "Dubhe (bowl top-right)",
      "Merak (bowl bot-right)",
      "Phecda (bowl bot-left)",
      "Megrez junction to close"
    ],
    "waypointLabels": [
      "Alkaid",
      "Mizar",
      "Alioth",
      "Megrez",
      "Dubhe",
      "Merak",
      "Phecda",
      "Close"
    ]
  },
  {
    "key": "constellation_cassiopeia",
    "name": "Cassiopeia W",
    "icon": "🌌",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Queen Cassiopeia Crown W",
    "points": [
      {
        "x": 0.15,
        "y": 0.35
      },
      {
        "x": 0.32,
        "y": 0.65
      },
      {
        "x": 0.5,
        "y": 0.42
      },
      {
        "x": 0.68,
        "y": 0.72
      },
      {
        "x": 0.85,
        "y": 0.35
      },
      {
        "x": 0.72,
        "y": 0.75
      },
      {
        "x": 0.5,
        "y": 0.48
      },
      {
        "x": 0.3,
        "y": 0.7
      }
    ],
    "stepDescriptions": [
      "Caph (star 1)",
      "Schedar (star 2)",
      "Navi (center peak)",
      "Ruchbah (star 4)",
      "Segin (star 5)",
      "Loop return to start"
    ],
    "waypointLabels": [
      "Caph",
      "Schedar",
      "Navi",
      "Ruchbah",
      "Segin",
      "Close"
    ]
  },
  {
    "key": "orion_hourglass",
    "name": "Orion Constellation",
    "icon": "⚔️",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Orion Hunter Silhouette",
    "points": [
      {
        "x": 0.3,
        "y": 0.2
      },
      {
        "x": 0.7,
        "y": 0.22
      },
      {
        "x": 0.58,
        "y": 0.48
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.42,
        "y": 0.52
      },
      {
        "x": 0.75,
        "y": 0.82
      },
      {
        "x": 0.25,
        "y": 0.8
      },
      {
        "x": 0.42,
        "y": 0.52
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.58,
        "y": 0.48
      }
    ],
    "stepDescriptions": [
      "Betelgeuse",
      "Bellatrix",
      "Alnitak (belt)",
      "Alnilam",
      "Mintaka",
      "Saiph",
      "Rigel",
      "Back through belt to Betelgeuse"
    ],
    "waypointLabels": [
      "Betelgeuse",
      "Bellatrix",
      "Belt Right",
      "Belt Center",
      "Belt Left",
      "Saiph",
      "Rigel",
      "Close"
    ],
    "waypointIndices": [
      0,
      1,
      3,
      5,
      6,
      8,
      0
    ]
  },
  {
    "key": "labyrinth_spiral",
    "name": "Square Maze Labyrinth",
    "icon": "🌀",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Concentric Square Labyrinth",
    "points": [
      {
        "x": 0.18,
        "y": 0.18
      },
      {
        "x": 0.82,
        "y": 0.18
      },
      {
        "x": 0.82,
        "y": 0.82
      },
      {
        "x": 0.26,
        "y": 0.82
      },
      {
        "x": 0.26,
        "y": 0.26
      },
      {
        "x": 0.74,
        "y": 0.26
      },
      {
        "x": 0.74,
        "y": 0.74
      },
      {
        "x": 0.34,
        "y": 0.74
      },
      {
        "x": 0.34,
        "y": 0.34
      },
      {
        "x": 0.66,
        "y": 0.34
      },
      {
        "x": 0.66,
        "y": 0.66
      },
      {
        "x": 0.42,
        "y": 0.66
      },
      {
        "x": 0.42,
        "y": 0.42
      },
      {
        "x": 0.58,
        "y": 0.42
      },
      {
        "x": 0.58,
        "y": 0.58
      },
      {
        "x": 0.5,
        "y": 0.58
      }
    ],
    "stepDescriptions": [
      "Outer top-left",
      "Outer top-right",
      "Outer bot-right",
      "Outer bot-left",
      "Ring 2 top-left",
      "Ring 2 top-right",
      "Ring 2 bot-right",
      "Ring 2 bot-left",
      "Ring 3 top-left",
      "Ring 3 top-right",
      "Ring 3 bot-right",
      "Ring 3 bot-left",
      "Inner center to goal"
    ],
    "waypointLabels": [
      "Start Outer",
      "Corner 1",
      "Corner 2",
      "Ring 2",
      "Ring 2-R",
      "Ring 3",
      "Ring 3-R",
      "Center Core",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      10,
      13,
      0
    ]
  },
  {
    "key": "star_compass",
    "name": "Compass Rose",
    "icon": "🧭",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Mariners Compass Rose",
    "points": [
      {
        "x": 0.5,
        "y": 0.12
      },
      {
        "x": 0.56,
        "y": 0.38
      },
      {
        "x": 0.68,
        "y": 0.32
      },
      {
        "x": 0.62,
        "y": 0.44
      },
      {
        "x": 0.88,
        "y": 0.5
      },
      {
        "x": 0.62,
        "y": 0.56
      },
      {
        "x": 0.68,
        "y": 0.68
      },
      {
        "x": 0.56,
        "y": 0.62
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.44,
        "y": 0.62
      },
      {
        "x": 0.32,
        "y": 0.68
      },
      {
        "x": 0.38,
        "y": 0.56
      },
      {
        "x": 0.12,
        "y": 0.5
      },
      {
        "x": 0.38,
        "y": 0.44
      },
      {
        "x": 0.32,
        "y": 0.32
      },
      {
        "x": 0.44,
        "y": 0.38
      }
    ],
    "stepDescriptions": [
      "North main tip",
      "North inner right",
      "North-East tip",
      "East inner top",
      "East main tip",
      "East inner bot",
      "South-East tip",
      "South inner right",
      "South main tip",
      "South inner left",
      "South-West tip",
      "West inner bot",
      "West main tip",
      "West inner top",
      "North-West tip",
      "North inner left to close"
    ],
    "waypointLabels": [
      "North",
      "North-East",
      "East",
      "South-East",
      "South",
      "South-West",
      "West",
      "North-West",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      10,
      12,
      14,
      0
    ]
  },
  {
    "key": "phoenix_crest",
    "name": "Rising Phoenix Wings",
    "icon": "🔥",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Mythical Phoenix Crest",
    "points": [
      {
        "x": 0.5,
        "y": 0.2
      },
      {
        "x": 0.6,
        "y": 0.32
      },
      {
        "x": 0.82,
        "y": 0.18
      },
      {
        "x": 0.75,
        "y": 0.45
      },
      {
        "x": 0.88,
        "y": 0.52
      },
      {
        "x": 0.68,
        "y": 0.62
      },
      {
        "x": 0.75,
        "y": 0.75
      },
      {
        "x": 0.55,
        "y": 0.75
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.45,
        "y": 0.75
      },
      {
        "x": 0.25,
        "y": 0.75
      },
      {
        "x": 0.32,
        "y": 0.62
      },
      {
        "x": 0.12,
        "y": 0.52
      },
      {
        "x": 0.25,
        "y": 0.45
      },
      {
        "x": 0.18,
        "y": 0.18
      },
      {
        "x": 0.4,
        "y": 0.32
      }
    ],
    "stepDescriptions": [
      "Beak crest",
      "Right head",
      "Upper-right feather tip",
      "Wing notch 1",
      "Mid-right feather tip",
      "Wing notch 2",
      "Lower-right feather tip",
      "Tail flank right",
      "Tail plume",
      "Tail flank left",
      "Lower-left feather tip",
      "Wing notch 3",
      "Mid-left feather tip",
      "Wing notch 4",
      "Upper-left feather tip",
      "Left head to close"
    ],
    "waypointLabels": [
      "Crest",
      "Wing-R Top",
      "Wing-R Mid",
      "Wing-R Bot",
      "Tail Plume",
      "Wing-L Bot",
      "Wing-L Mid",
      "Wing-L Top",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      10,
      12,
      14,
      0
    ]
  },
  {
    "key": "letter_b",
    "name": "Letter B Glyph",
    "icon": "🅱️",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Letter B Profile",
    "points": [
      {
        "x": 0.25,
        "y": 0.2
      },
      {
        "x": 0.65,
        "y": 0.2
      },
      {
        "x": 0.75,
        "y": 0.35
      },
      {
        "x": 0.65,
        "y": 0.5
      },
      {
        "x": 0.78,
        "y": 0.65
      },
      {
        "x": 0.65,
        "y": 0.8
      },
      {
        "x": 0.25,
        "y": 0.8
      }
    ],
    "stepDescriptions": [
      "Top-Left spine",
      "Upper bowl top",
      "Upper bowl apex",
      "Waist junction",
      "Lower bowl apex",
      "Lower bowl bottom",
      "Bottom-Left to close"
    ],
    "waypointLabels": [
      "Spine Top",
      "Bowl 1 Top",
      "Bowl 1 Apex",
      "Waist",
      "Bowl 2 Apex",
      "Bowl 2 Bot",
      "Close"
    ]
  },
  {
    "key": "letter_d",
    "name": "Letter D Arch",
    "icon": "🅳",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Letter D Arch",
    "points": [
      {
        "x": 0.25,
        "y": 0.2
      },
      {
        "x": 0.55,
        "y": 0.2
      },
      {
        "x": 0.78,
        "y": 0.38
      },
      {
        "x": 0.78,
        "y": 0.62
      },
      {
        "x": 0.55,
        "y": 0.8
      },
      {
        "x": 0.25,
        "y": 0.8
      }
    ],
    "stepDescriptions": [
      "Top-Left spine",
      "Top rim",
      "Arch top",
      "Arch bottom",
      "Bottom rim",
      "Bottom-Left spine to close"
    ],
    "waypointLabels": [
      "Spine Top",
      "Rim Top",
      "Arch Top",
      "Arch Bot",
      "Rim Bot",
      "Close"
    ]
  },
  {
    "key": "letter_f",
    "name": "Letter F Frame",
    "icon": "🅵",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Letter F Frame",
    "points": [
      {
        "x": 0.25,
        "y": 0.2
      },
      {
        "x": 0.78,
        "y": 0.2
      },
      {
        "x": 0.78,
        "y": 0.35
      },
      {
        "x": 0.42,
        "y": 0.35
      },
      {
        "x": 0.42,
        "y": 0.48
      },
      {
        "x": 0.68,
        "y": 0.48
      },
      {
        "x": 0.68,
        "y": 0.6
      },
      {
        "x": 0.42,
        "y": 0.6
      },
      {
        "x": 0.42,
        "y": 0.8
      },
      {
        "x": 0.25,
        "y": 0.8
      }
    ],
    "stepDescriptions": [
      "Top-Left",
      "Top bar right",
      "Top bar drop",
      "Spine top",
      "Mid bar right",
      "Mid bar drop",
      "Mid bar under",
      "Spine mid",
      "Spine foot",
      "Close"
    ],
    "waypointLabels": [
      "Top-Left",
      "Bar 1",
      "Drop 1",
      "Spine 1",
      "Bar 2",
      "Drop 2",
      "Under 2",
      "Spine 2",
      "Foot",
      "Close"
    ]
  },
  {
    "key": "letter_s",
    "name": "Letter S Curve",
    "icon": "🆂",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Block Letter S",
    "points": [
      {
        "x": 0.75,
        "y": 0.28
      },
      {
        "x": 0.5,
        "y": 0.2
      },
      {
        "x": 0.3,
        "y": 0.35
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.72,
        "y": 0.65
      },
      {
        "x": 0.5,
        "y": 0.8
      },
      {
        "x": 0.25,
        "y": 0.72
      },
      {
        "x": 0.45,
        "y": 0.68
      },
      {
        "x": 0.6,
        "y": 0.58
      },
      {
        "x": 0.4,
        "y": 0.45
      },
      {
        "x": 0.25,
        "y": 0.35
      },
      {
        "x": 0.45,
        "y": 0.28
      }
    ],
    "stepDescriptions": [
      "Upper beak",
      "Top crest",
      "Upper belly",
      "Center waist",
      "Lower cheek",
      "Bottom bowl",
      "Lower tail",
      "Inner lower",
      "Inner waist",
      "Inner chest",
      "Inner top",
      "Close"
    ],
    "waypointLabels": [
      "Beak",
      "Crest",
      "Upper Belly",
      "Waist",
      "Lower Cheek",
      "Bottom Bowl",
      "Tail",
      "Inner Low",
      "Inner Waist",
      "Inner High",
      "Inner Top",
      "Close"
    ]
  },
  {
    "key": "letter_t",
    "name": "Letter T Monogram",
    "icon": "🆃",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Letter T Silhouette",
    "points": [
      {
        "x": 0.2,
        "y": 0.2
      },
      {
        "x": 0.8,
        "y": 0.2
      },
      {
        "x": 0.8,
        "y": 0.35
      },
      {
        "x": 0.58,
        "y": 0.35
      },
      {
        "x": 0.58,
        "y": 0.82
      },
      {
        "x": 0.42,
        "y": 0.82
      },
      {
        "x": 0.42,
        "y": 0.35
      },
      {
        "x": 0.2,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Bar left",
      "Bar right",
      "Bar drop right",
      "Stem right",
      "Stem foot right",
      "Stem foot left",
      "Stem left",
      "Close"
    ],
    "waypointLabels": [
      "Bar-L",
      "Bar-R",
      "Drop-R",
      "Stem-R",
      "Foot-R",
      "Foot-L",
      "Stem-L",
      "Close"
    ]
  },
  {
    "key": "number_two",
    "name": "Number 2",
    "icon": "2️⃣",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Number 2 Glyph",
    "points": [
      {
        "x": 0.28,
        "y": 0.32
      },
      {
        "x": 0.5,
        "y": 0.2
      },
      {
        "x": 0.72,
        "y": 0.32
      },
      {
        "x": 0.72,
        "y": 0.45
      },
      {
        "x": 0.3,
        "y": 0.75
      },
      {
        "x": 0.75,
        "y": 0.75
      },
      {
        "x": 0.75,
        "y": 0.85
      },
      {
        "x": 0.25,
        "y": 0.85
      },
      {
        "x": 0.25,
        "y": 0.72
      },
      {
        "x": 0.55,
        "y": 0.42
      },
      {
        "x": 0.5,
        "y": 0.32
      },
      {
        "x": 0.35,
        "y": 0.38
      }
    ],
    "stepDescriptions": [
      "Crest start",
      "Top crown",
      "Right shoulder",
      "Upper curve",
      "Diagonal base",
      "Foot right",
      "Base drop",
      "Base left",
      "Rise diagonal",
      "Inner curve",
      "Inner crest",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
      "P10",
      "P11",
      "Close"
    ]
  },
  {
    "key": "number_three",
    "name": "Number 3",
    "icon": "3️⃣",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Number 3 Glyph",
    "points": [
      {
        "x": 0.28,
        "y": 0.22
      },
      {
        "x": 0.72,
        "y": 0.22
      },
      {
        "x": 0.5,
        "y": 0.48
      },
      {
        "x": 0.72,
        "y": 0.62
      },
      {
        "x": 0.68,
        "y": 0.8
      },
      {
        "x": 0.45,
        "y": 0.85
      },
      {
        "x": 0.28,
        "y": 0.78
      },
      {
        "x": 0.35,
        "y": 0.68
      },
      {
        "x": 0.52,
        "y": 0.72
      },
      {
        "x": 0.56,
        "y": 0.58
      },
      {
        "x": 0.38,
        "y": 0.48
      },
      {
        "x": 0.58,
        "y": 0.34
      },
      {
        "x": 0.28,
        "y": 0.34
      }
    ],
    "stepDescriptions": [
      "Top bar left",
      "Top bar right",
      "Waist center",
      "Lower bowl apex",
      "Bottom right curve",
      "Bottom base",
      "Lower tail",
      "Inner tail",
      "Inner bowl",
      "Inner waist",
      "Inner chest",
      "Inner top",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
      "P9",
      "P10",
      "P11",
      "P12",
      "Close"
    ]
  },
  {
    "key": "number_four",
    "name": "Number 4",
    "icon": "4️⃣",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Number 4 Glyph",
    "points": [
      {
        "x": 0.58,
        "y": 0.18
      },
      {
        "x": 0.25,
        "y": 0.62
      },
      {
        "x": 0.78,
        "y": 0.62
      },
      {
        "x": 0.78,
        "y": 0.72
      },
      {
        "x": 0.58,
        "y": 0.72
      },
      {
        "x": 0.58,
        "y": 0.85
      },
      {
        "x": 0.46,
        "y": 0.85
      },
      {
        "x": 0.46,
        "y": 0.72
      },
      {
        "x": 0.18,
        "y": 0.72
      },
      {
        "x": 0.18,
        "y": 0.58
      },
      {
        "x": 0.46,
        "y": 0.18
      }
    ],
    "stepDescriptions": [
      "Mast peak",
      "Diagonal down to crossbar",
      "Crossbar right",
      "Crossbar drop",
      "Right stem",
      "Stem foot right",
      "Stem foot left",
      "Left stem",
      "Crossbar under",
      "Crossbar left",
      "Close"
    ],
    "waypointLabels": [
      "Peak",
      "Crossbar-L",
      "Crossbar-R",
      "Drop-R",
      "Stem-R",
      "Foot-R",
      "Foot-L",
      "Stem-L",
      "Under-L",
      "Cross-L",
      "Close"
    ]
  },
  {
    "key": "number_eight",
    "name": "Number 8",
    "icon": "8️⃣",
    "tier": 2,
    "difficulty": "Medium",
    "description": "Number 8 Silhouette",
    "points": [
      {
        "x": 0.5,
        "y": 0.2
      },
      {
        "x": 0.65,
        "y": 0.26
      },
      {
        "x": 0.65,
        "y": 0.42
      },
      {
        "x": 0.75,
        "y": 0.58
      },
      {
        "x": 0.75,
        "y": 0.78
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.25,
        "y": 0.78
      },
      {
        "x": 0.25,
        "y": 0.58
      },
      {
        "x": 0.35,
        "y": 0.42
      },
      {
        "x": 0.35,
        "y": 0.26
      }
    ],
    "stepDescriptions": [
      "Top crown",
      "Upper right",
      "Waist right",
      "Lower right",
      "Bottom base right",
      "Bottom tip",
      "Bottom base left",
      "Lower left",
      "Waist left",
      "Upper left to close"
    ],
    "waypointLabels": [
      "Crown",
      "Top-R",
      "Waist-R",
      "Bot-R",
      "Base-R",
      "Base-L",
      "Bot-L",
      "Waist-L",
      "Top-L",
      "Close"
    ]
  },
  {
    "key": "crescent_star",
    "name": "Moon and Star",
    "icon": "☪️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Celestial Crescent",
    "points": [
      {
        "x": 0.4,
        "y": 0.18
      },
      {
        "x": 0.62,
        "y": 0.3
      },
      {
        "x": 0.65,
        "y": 0.65
      },
      {
        "x": 0.4,
        "y": 0.82
      },
      {
        "x": 0.52,
        "y": 0.65
      },
      {
        "x": 0.52,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Crescent tip top",
      "Outer belly",
      "Outer base",
      "Crescent tip bot",
      "Inner scoop bot",
      "Inner scoop top to close"
    ],
    "waypointLabels": [
      "Tip Top",
      "Belly",
      "Base",
      "Tip Bot",
      "Scoop Bot",
      "Close"
    ]
  },
  {
    "key": "shield_spartan",
    "name": "Spartan Hoplon",
    "icon": "🛡️",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Spartan Hoplite Shield",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.85,
        "y": 0.45
      },
      {
        "x": 0.72,
        "y": 0.82
      },
      {
        "x": 0.5,
        "y": 0.72
      },
      {
        "x": 0.28,
        "y": 0.82
      },
      {
        "x": 0.15,
        "y": 0.45
      }
    ],
    "stepDescriptions": [
      "Top vertex",
      "Upper right rim",
      "Lower right spur",
      "Bottom chevron notch",
      "Lower left spur",
      "Upper left rim to close"
    ],
    "waypointLabels": [
      "Top",
      "Right Rim",
      "Right Spur",
      "Notch",
      "Left Spur",
      "Left Rim",
      "Close"
    ]
  },
  {
    "key": "star_7pt",
    "name": "7-Point Star",
    "icon": "🔯",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Heptagram 7-Point Star",
    "points": [
      {
        "x": 0.5,
        "y": 0.14
      },
      {
        "x": 0.5781,
        "y": 0.3378
      },
      {
        "x": 0.7815,
        "y": 0.2755
      },
      {
        "x": 0.6755,
        "y": 0.4599
      },
      {
        "x": 0.851,
        "y": 0.5801
      },
      {
        "x": 0.6407,
        "y": 0.6122
      },
      {
        "x": 0.6562,
        "y": 0.8243
      },
      {
        "x": 0.5,
        "y": 0.68
      },
      {
        "x": 0.3438,
        "y": 0.8243
      },
      {
        "x": 0.3593,
        "y": 0.6122
      },
      {
        "x": 0.149,
        "y": 0.5801
      },
      {
        "x": 0.3245,
        "y": 0.4599
      },
      {
        "x": 0.2185,
        "y": 0.2755
      },
      {
        "x": 0.4219,
        "y": 0.3378
      }
    ],
    "stepDescriptions": [
      "Point 1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      10,
      12,
      0
    ]
  },
  {
    "key": "star_16pt",
    "name": "16-Point Sunburst",
    "icon": "☀️",
    "tier": 4,
    "difficulty": "Expert",
    "description": "16-Point Radiant Sunburst",
    "points": [
      {
        "x": 0.5,
        "y": 0.12
      },
      {
        "x": 0.5546,
        "y": 0.2254
      },
      {
        "x": 0.6454,
        "y": 0.1489
      },
      {
        "x": 0.6556,
        "y": 0.2672
      },
      {
        "x": 0.7687,
        "y": 0.2313
      },
      {
        "x": 0.7328,
        "y": 0.3444
      },
      {
        "x": 0.8511,
        "y": 0.3546
      },
      {
        "x": 0.7746,
        "y": 0.4454
      },
      {
        "x": 0.88,
        "y": 0.5
      },
      {
        "x": 0.7746,
        "y": 0.5546
      },
      {
        "x": 0.8511,
        "y": 0.6454
      },
      {
        "x": 0.7328,
        "y": 0.6556
      },
      {
        "x": 0.7687,
        "y": 0.7687
      },
      {
        "x": 0.6556,
        "y": 0.7328
      },
      {
        "x": 0.6454,
        "y": 0.8511
      },
      {
        "x": 0.5546,
        "y": 0.7746
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.4454,
        "y": 0.7746
      },
      {
        "x": 0.3546,
        "y": 0.8511
      },
      {
        "x": 0.3444,
        "y": 0.7328
      },
      {
        "x": 0.2313,
        "y": 0.7687
      },
      {
        "x": 0.2672,
        "y": 0.6556
      },
      {
        "x": 0.1489,
        "y": 0.6454
      },
      {
        "x": 0.2254,
        "y": 0.5546
      },
      {
        "x": 0.12,
        "y": 0.5
      },
      {
        "x": 0.2254,
        "y": 0.4454
      },
      {
        "x": 0.1489,
        "y": 0.3546
      },
      {
        "x": 0.2672,
        "y": 0.3444
      },
      {
        "x": 0.2313,
        "y": 0.2313
      },
      {
        "x": 0.3444,
        "y": 0.2672
      },
      {
        "x": 0.3546,
        "y": 0.1489
      },
      {
        "x": 0.4454,
        "y": 0.2254
      }
    ],
    "stepDescriptions": [
      "Point 1",
      "P3",
      "P5",
      "P7",
      "P9",
      "P11",
      "P13",
      "P15",
      "Close"
    ],
    "waypointLabels": [
      "P1",
      "P3",
      "P5",
      "P7",
      "P9",
      "P11",
      "P13",
      "P15",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      16,
      20,
      24,
      28,
      0
    ]
  },
  {
    "key": "bow_arrow_set",
    "name": "Archers Bow",
    "icon": "🏹",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Recurve Archers Bow",
    "points": [
      {
        "x": 0.3,
        "y": 0.15
      },
      {
        "x": 0.65,
        "y": 0.22
      },
      {
        "x": 0.78,
        "y": 0.5
      },
      {
        "x": 0.65,
        "y": 0.78
      },
      {
        "x": 0.3,
        "y": 0.85
      },
      {
        "x": 0.3,
        "y": 0.5
      }
    ],
    "stepDescriptions": [
      "Upper nock",
      "Upper limb bow",
      "Bow grip belly",
      "Lower limb bow",
      "Lower nock",
      "Bowstring center to close"
    ],
    "waypointLabels": [
      "Upper Nock",
      "Upper Limb",
      "Grip Belly",
      "Lower Limb",
      "Lower Nock",
      "String Center",
      "Close"
    ]
  },
  {
    "key": "padlock_secure",
    "name": "Security Padlock",
    "icon": "🔒",
    "tier": 3,
    "difficulty": "Hard",
    "description": "Heavy Security Padlock",
    "points": [
      {
        "x": 0.35,
        "y": 0.42
      },
      {
        "x": 0.35,
        "y": 0.25
      },
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.65,
        "y": 0.25
      },
      {
        "x": 0.65,
        "y": 0.42
      },
      {
        "x": 0.78,
        "y": 0.42
      },
      {
        "x": 0.78,
        "y": 0.82
      },
      {
        "x": 0.22,
        "y": 0.82
      },
      {
        "x": 0.22,
        "y": 0.42
      }
    ],
    "stepDescriptions": [
      "Shackle left",
      "Shackle arch left",
      "Shackle crown",
      "Shackle arch right",
      "Shackle right",
      "Body top-right",
      "Body bot-right",
      "Body bot-left",
      "Body top-left to close"
    ],
    "waypointLabels": [
      "Shackle-L",
      "Arch-L",
      "Crown",
      "Arch-R",
      "Shackle-R",
      "Body-TR",
      "Body-BR",
      "Body-BL",
      "Close"
    ]
  },
  {
    "key": "celtic_triquetra",
    "name": "Celtic Triquetra",
    "icon": "♾️",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Trinity Celtic Triquetra",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.65,
        "y": 0.38
      },
      {
        "x": 0.82,
        "y": 0.72
      },
      {
        "x": 0.55,
        "y": 0.65
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.45,
        "y": 0.65
      },
      {
        "x": 0.18,
        "y": 0.72
      },
      {
        "x": 0.35,
        "y": 0.38
      }
    ],
    "stepDescriptions": [
      "Top cusp apex",
      "Right arc curve",
      "Bottom-Right cusp apex",
      "Lower inner junction",
      "Bottom cusp point",
      "Left inner junction",
      "Bottom-Left cusp apex",
      "Left arc curve to close"
    ],
    "waypointLabels": [
      "Top Apex",
      "Right Curve",
      "Bot-Right Apex",
      "Inner Junction",
      "Bottom Point",
      "Inner Left",
      "Bot-Left Apex",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      0
    ]
  },
  {
    "key": "star_of_david",
    "name": "Sacred Star of David",
    "icon": "✡️",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Star of David Seal",
    "points": [
      {
        "x": 0.5,
        "y": 0.14
      },
      {
        "x": 0.605,
        "y": 0.3181
      },
      {
        "x": 0.8118,
        "y": 0.32
      },
      {
        "x": 0.71,
        "y": 0.5
      },
      {
        "x": 0.8118,
        "y": 0.68
      },
      {
        "x": 0.605,
        "y": 0.6819
      },
      {
        "x": 0.5,
        "y": 0.86
      },
      {
        "x": 0.395,
        "y": 0.6819
      },
      {
        "x": 0.1882,
        "y": 0.68
      },
      {
        "x": 0.29,
        "y": 0.5
      },
      {
        "x": 0.1882,
        "y": 0.32
      },
      {
        "x": 0.395,
        "y": 0.3181
      }
    ],
    "stepDescriptions": [
      "North Point",
      "Inner Notch 1",
      "East Point",
      "Inner Notch 2",
      "South-East Point",
      "Inner Notch 3",
      "South Point",
      "Inner Notch 4",
      "West Point",
      "Inner Notch 5",
      "North-West Point",
      "Close"
    ],
    "waypointLabels": [
      "North",
      "North-East",
      "South-East",
      "South",
      "South-West",
      "North-West",
      "Close"
    ],
    "waypointIndices": [
      0,
      2,
      4,
      6,
      8,
      10,
      0
    ]
  },
  {
    "key": "infinity_heart",
    "name": "Infinity Love Loop",
    "icon": "♾️",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Infinity Heart Knot",
    "points": [
      {
        "x": 0.5,
        "y": 0.38
      },
      {
        "x": 0.65,
        "y": 0.22
      },
      {
        "x": 0.82,
        "y": 0.38
      },
      {
        "x": 0.7,
        "y": 0.68
      },
      {
        "x": 0.5,
        "y": 0.52
      },
      {
        "x": 0.3,
        "y": 0.68
      },
      {
        "x": 0.18,
        "y": 0.38
      },
      {
        "x": 0.35,
        "y": 0.22
      }
    ],
    "stepDescriptions": [
      "Center crossover",
      "Right upper heart loop",
      "Right flank",
      "Right lower waist",
      "Center crossing",
      "Left lower waist",
      "Left flank",
      "Left upper heart loop to close"
    ],
    "waypointLabels": [
      "Center",
      "Loop-R Top",
      "Flank-R",
      "Waist-R",
      "Cross Mid",
      "Waist-L",
      "Flank-L",
      "Close"
    ]
  },
  {
    "key": "solar_eclipse",
    "name": "Solar Corona Eclipse",
    "icon": "🪐",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Total Solar Eclipse Corona",
    "points": [
      {
        "x": 0.5,
        "y": 0.16
      },
      {
        "x": 0.6301,
        "y": 0.1859
      },
      {
        "x": 0.7404,
        "y": 0.2596
      },
      {
        "x": 0.8141,
        "y": 0.3699
      },
      {
        "x": 0.84,
        "y": 0.5
      },
      {
        "x": 0.8141,
        "y": 0.6301
      },
      {
        "x": 0.7404,
        "y": 0.7404
      },
      {
        "x": 0.6301,
        "y": 0.8141
      },
      {
        "x": 0.5,
        "y": 0.84
      },
      {
        "x": 0.3699,
        "y": 0.8141
      },
      {
        "x": 0.2596,
        "y": 0.7404
      },
      {
        "x": 0.1859,
        "y": 0.6301
      },
      {
        "x": 0.16,
        "y": 0.5
      },
      {
        "x": 0.1859,
        "y": 0.3699
      },
      {
        "x": 0.2596,
        "y": 0.2596
      },
      {
        "x": 0.3699,
        "y": 0.1859
      }
    ],
    "stepDescriptions": [
      "Corona Top (12h)",
      "Corona East (3h)",
      "Corona South (6h)",
      "Corona West (9h)",
      "Close at Top"
    ],
    "waypointLabels": [
      "Top Corona",
      "East Corona",
      "South Corona",
      "West Corona",
      "Close"
    ],
    "waypointIndices": [
      0,
      4,
      8,
      12,
      0
    ]
  },
  {
    "key": "prism_pyramid",
    "name": "3D Pyramid Silhouette",
    "icon": "🔺",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Giza Pyramid Silhouette",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.82,
        "y": 0.75
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.18,
        "y": 0.75
      }
    ],
    "stepDescriptions": [
      "Apex capstone",
      "Right face base corner",
      "Center baseline spur",
      "Left face base corner to close"
    ],
    "waypointLabels": [
      "Apex",
      "Right Corner",
      "Spur Center",
      "Left Corner",
      "Close"
    ]
  },
  {
    "key": "double_helix",
    "name": "DNA Helix Turn",
    "icon": "🧬",
    "tier": 4,
    "difficulty": "Expert",
    "description": "DNA Double Helix",
    "points": [
      {
        "x": 0.25,
        "y": 0.2
      },
      {
        "x": 0.5,
        "y": 0.35
      },
      {
        "x": 0.75,
        "y": 0.2
      },
      {
        "x": 0.5,
        "y": 0.5
      },
      {
        "x": 0.25,
        "y": 0.8
      },
      {
        "x": 0.5,
        "y": 0.65
      },
      {
        "x": 0.75,
        "y": 0.8
      },
      {
        "x": 0.5,
        "y": 0.5
      }
    ],
    "stepDescriptions": [
      "Strand 1 top-left",
      "Strand 1 crossover",
      "Strand 1 top-right",
      "Center node 1",
      "Strand 2 bot-left",
      "Strand 2 crossover",
      "Strand 2 bot-right",
      "Center node 2 to close"
    ],
    "waypointLabels": [
      "Top-L",
      "Cross-1",
      "Top-R",
      "Node-1",
      "Bot-L",
      "Cross-2",
      "Bot-R",
      "Close"
    ]
  },
  {
    "key": "anchor_cross_cross",
    "name": "Mariners Anchor Cross",
    "icon": "⚓",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Crux Mariners Cross",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.56,
        "y": 0.2
      },
      {
        "x": 0.56,
        "y": 0.32
      },
      {
        "x": 0.74,
        "y": 0.32
      },
      {
        "x": 0.74,
        "y": 0.38
      },
      {
        "x": 0.56,
        "y": 0.38
      },
      {
        "x": 0.56,
        "y": 0.72
      },
      {
        "x": 0.8,
        "y": 0.62
      },
      {
        "x": 0.82,
        "y": 0.72
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.18,
        "y": 0.72
      },
      {
        "x": 0.2,
        "y": 0.62
      },
      {
        "x": 0.44,
        "y": 0.72
      },
      {
        "x": 0.44,
        "y": 0.38
      },
      {
        "x": 0.26,
        "y": 0.38
      },
      {
        "x": 0.26,
        "y": 0.32
      },
      {
        "x": 0.44,
        "y": 0.32
      },
      {
        "x": 0.44,
        "y": 0.2
      }
    ],
    "stepDescriptions": [
      "Cross ring apex",
      "Crossbar right",
      "Shaft down",
      "Right fluke hook",
      "Crown keel",
      "Left fluke hook",
      "Shaft up",
      "Crossbar left",
      "Close"
    ],
    "waypointLabels": [
      "Apex Ring",
      "Beam-R",
      "Hook-R",
      "Keel Crown",
      "Hook-L",
      "Beam-L",
      "Close"
    ],
    "waypointIndices": [
      0,
      3,
      7,
      9,
      11,
      15,
      0
    ]
  },
  {
    "key": "crescent_double",
    "name": "Double Horn Crescent",
    "icon": "🌙",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Dual Horned Crescent",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.75,
        "y": 0.3
      },
      {
        "x": 0.75,
        "y": 0.7
      },
      {
        "x": 0.5,
        "y": 0.85
      },
      {
        "x": 0.6,
        "y": 0.65
      },
      {
        "x": 0.6,
        "y": 0.35
      }
    ],
    "stepDescriptions": [
      "Upper horn tip",
      "Outer bow top",
      "Outer bow bottom",
      "Lower horn tip",
      "Inner cusp bottom",
      "Inner cusp top to close"
    ],
    "waypointLabels": [
      "Horn Top",
      "Bow Top",
      "Bow Bot",
      "Horn Bot",
      "Cusp Bot",
      "Close"
    ]
  },
  {
    "key": "dragon_scale",
    "name": "Shield Dragon Scale",
    "icon": "🐉",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Dragon Scale Emblem",
    "points": [
      {
        "x": 0.5,
        "y": 0.15
      },
      {
        "x": 0.78,
        "y": 0.32
      },
      {
        "x": 0.82,
        "y": 0.6
      },
      {
        "x": 0.5,
        "y": 0.88
      },
      {
        "x": 0.18,
        "y": 0.6
      },
      {
        "x": 0.22,
        "y": 0.32
      }
    ],
    "stepDescriptions": [
      "Scale top crest",
      "Upper right facet",
      "Lower right flank",
      "Bottom razor spike",
      "Lower left flank",
      "Upper left facet to close"
    ],
    "waypointLabels": [
      "Crest",
      "Facet-R",
      "Flank-R",
      "Spike Tip",
      "Flank-L",
      "Facet-L",
      "Close"
    ]
  },
  {
    "key": "zen_circle",
    "name": "Ensō Zen Circle",
    "icon": "⭕",
    "tier": 4,
    "difficulty": "Expert",
    "description": "Ensō Zen Brush Circle",
    "points": [
      {
        "x": 0.52,
        "y": 0.18
      },
      {
        "x": 0.78,
        "y": 0.28
      },
      {
        "x": 0.85,
        "y": 0.55
      },
      {
        "x": 0.72,
        "y": 0.8
      },
      {
        "x": 0.45,
        "y": 0.85
      },
      {
        "x": 0.22,
        "y": 0.72
      },
      {
        "x": 0.15,
        "y": 0.45
      },
      {
        "x": 0.28,
        "y": 0.22
      },
      {
        "x": 0.48,
        "y": 0.18
      }
    ],
    "stepDescriptions": [
      "Brush strike start",
      "Right sweep arc",
      "Lower right curve",
      "Bottom base stroke",
      "Lower left curve",
      "Ascending left stroke",
      "Upper left curve",
      "Finishing gap to close"
    ],
    "waypointLabels": [
      "Start Stroke",
      "East Arc",
      "South-East",
      "South Base",
      "South-West",
      "West Arc",
      "North-West",
      "Finish Gap",
      "Close"
    ]
  }
];

// Map of shape keys to their shape objects
export const SHAPE_LIBRARY = SHAPES_DATA.reduce((acc, shape) => {
  acc[shape.key] = shape;
  return acc;
}, {});

// Return an appropriate shape based on player's level (Progressive Difficulty)
export function getShapeForLevel(level = 1, currentKey = null) {
  let targetTier = 1;
  if (level > 25) {
    targetTier = 4; // Expert
  } else if (level > 15) {
    targetTier = 3; // Hard
  } else if (level > 5) {
    targetTier = 2; // Medium
  } else {
    targetTier = 1; // Easy
  }

  // Filter shapes matching this tier
  const tierShapes = SHAPES_DATA.filter(s => s.tier === targetTier);
  const eligible = tierShapes.filter(s => s.key !== currentKey);
  const pool = eligible.length > 0 ? eligible : tierShapes;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Convert a shape's points and definitions into structured waypoints
export function getVariationWaypoints(shape) {
  const pts = shape.points;
  const closedPts = [...pts, pts[0]];
  let waypoints = [];

  if (shape.waypointIndices && shape.waypointIndices.length > 0) {
    waypoints = shape.waypointIndices.map((idx, i) => {
      const pt = pts[idx % pts.length];
      const label = shape.waypointLabels?.[i] || `Point ${i + 1}`;
      const stepDesc = shape.stepDescriptions?.[i] || `Draw to ${label}`;
      return { x: pt.x, y: pt.y, label, stepDesc, index: i };
    });
  } else {
    for (let i = 0; i < closedPts.length; i++) {
      const pt = closedPts[i];
      const isClose = i === closedPts.length - 1;
      const label = isClose ? 'Close' : (shape.waypointLabels?.[i] || `Point ${i + 1}`);
      const stepDesc = shape.stepDescriptions?.[i] || (isClose ? 'Close shape back to start' : `Draw to ${label}`);
      waypoints.push({ x: pt.x, y: pt.y, label, stepDesc, index: i });
    }
  }
  return waypoints;
}
