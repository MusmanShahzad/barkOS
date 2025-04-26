"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileIcon, Upload } from "lucide-react"
import { mockBriefs, mockUsers } from "@/lib/mock-data"
import { formatFileSize, formatDate } from "@/lib/utils"
import Image from "next/image"
import EnhancedCommentSection from "@/components/enhanced-comment-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { TokenizedSelect } from "@/components/tokenized-select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

// Helper function for status color in badges
function getStatusColorForBadge(status) {
  switch (status?.toLowerCase()) {
    case "draft":
      return "#FEF3C7" // Light yellow
    case "review":
      return "#DBEAFE" // Light blue
    case "approved":
      return "#D1FAE5" // Light green
    default:
      return "#F3F4F6" // Light gray
  }
}

export default function AssetModal({ isOpen, onClose, onSave, asset = null }) {
  const [formData, setFormData] = useState({
    id: asset?.id || "",
    name: asset?.name || "",
    description: asset?.description || "",
    type: asset?.type || "image",
    size: asset?.size || 0,
    url: asset?.url || "",
    tags: asset?.tags || [],
    createdBy: asset?.createdBy || mockUsers[0],
    createdAt: asset?.createdAt || new Date(),
    comments: asset?.comments || [],
    relatedBriefs: asset?.relatedBriefs || [],
  })

  const [tagInput, setTagInput] = useState("")
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const inputRef = useRef(null)

  // All possible tags from all assets for autocomplete
  const allPossibleTags = [
    "design",
    "marketing",
    "social",
    "website",
    "campaign",
    "product",
    "brand",
    "video",
    "photo",
    "document",
    "presentation",
    "holiday",
    "summer",
    "winter",
    "spring",
    "fall",
    "promotion",
    "sale",
    "launch",
    "event",
    "mobile",
    "desktop",
    "print",
    "digital",
    "banner",
    "logo",
    "icon",
    "illustration",
    "typography",
    "color",
    "layout",
    "wireframe",
    "mockup",
    "prototype",
    "ui",
    "ux",
    "research",
    "testing",
    "analytics",
    "data",
    "report",
    "strategy",
    "planning",
    "execution",
    "review",
    "feedback",
    "revision",
    "final",
    "draft",
    "concept",
    "idea",
    "inspiration",
    "reference",
    "example",
    "template",
    "guide",
    "tutorial",
    "documentation",
    "specification",
    "requirement",
    "feature",
    "function",
    "component",
    "module",
    "system",
    "platform",
    "integration",
    "api",
    "database",
    "server",
    "client",
    "frontend",
    "backend",
    "fullstack",
    "development",
    "production",
    "staging",
    "testing",
    "qa",
    "release",
    "version",
    "update",
    "patch",
    "fix",
    "bug",
    "issue",
    "ticket",
    "task",
    "story",
    "epic",
    "sprint",
    "milestone",
    "roadmap",
    "timeline",
    "schedule",
    "deadline",
    "priority",
    "severity",
    "impact",
    "scope",
    "budget",
    "cost",
    "resource",
    "team",
    "stakeholder",
    "customer",
    "user",
    "audience",
    "target",
    "demographic",
    "segment",
    "persona",
    "journey",
    "experience",
    "interaction",
    "engagement",
    "conversion",
    "retention",
    "acquisition",
    "growth",
    "scale",
    "performance",
    "optimization",
    "efficiency",
    "effectiveness",
    "quality",
    "quantity",
    "measurement",
    "metric",
    "kpi",
    "goal",
    "objective",
    "vision",
    "mission",
    "value",
    "principle",
    "policy",
    "procedure",
    "process",
    "workflow",
    "pipeline",
    "funnel",
    "channel",
    "medium",
    "platform",
    "network",
    "community",
    "ecosystem",
    "environment",
    "context",
    "situation",
    "scenario",
    "case",
    "example",
    "instance",
    "occurrence",
    "event",
    "action",
    "activity",
    "behavior",
    "attitude",
    "perception",
    "cognition",
    "emotion",
    "feeling",
    "sentiment",
    "opinion",
    "feedback",
    "input",
    "output",
    "outcome",
    "result",
    "impact",
    "effect",
    "consequence",
    "implication",
    "significance",
    "importance",
    "relevance",
    "priority",
    "urgency",
    "criticality",
    "severity",
    "complexity",
    "simplicity",
    "clarity",
    "ambiguity",
    "uncertainty",
    "risk",
    "opportunity",
    "challenge",
    "problem",
    "solution",
    "resolution",
    "decision",
    "choice",
    "option",
    "alternative",
    "approach",
    "method",
    "technique",
    "tool",
    "technology",
    "innovation",
    "creativity",
    "originality",
    "uniqueness",
    "differentiation",
    "competition",
    "advantage",
    "benefit",
    "feature",
    "attribute",
    "characteristic",
    "property",
    "quality",
    "quantity",
    "dimension",
    "size",
    "scale",
    "scope",
    "range",
    "extent",
    "limit",
    "boundary",
    "constraint",
    "restriction",
    "requirement",
    "specification",
    "standard",
    "guideline",
    "rule",
    "regulation",
    "policy",
    "procedure",
    "protocol",
    "convention",
    "norm",
    "practice",
    "habit",
    "routine",
    "ritual",
    "tradition",
    "culture",
    "value",
    "belief",
    "attitude",
    "mindset",
    "perspective",
    "viewpoint",
    "standpoint",
    "position",
    "stance",
    "approach",
    "orientation",
    "direction",
    "trend",
    "pattern",
    "theme",
    "motif",
    "concept",
    "idea",
    "notion",
    "thought",
    "theory",
    "hypothesis",
    "assumption",
    "premise",
    "proposition",
    "argument",
    "reasoning",
    "logic",
    "rationale",
    "justification",
    "explanation",
    "interpretation",
    "understanding",
    "comprehension",
    "knowledge",
    "wisdom",
    "insight",
    "foresight",
    "hindsight",
    "reflection",
    "introspection",
    "awareness",
    "consciousness",
    "mindfulness",
    "attention",
    "focus",
    "concentration",
    "distraction",
    "interruption",
    "disruption",
    "interference",
    "noise",
    "signal",
    "message",
    "communication",
    "conversation",
    "dialogue",
    "discussion",
    "debate",
    "negotiation",
    "mediation",
    "facilitation",
    "coordination",
    "collaboration",
    "cooperation",
    "competition",
    "conflict",
    "tension",
    "friction",
    "harmony",
    "balance",
    "equilibrium",
    "stability",
    "instability",
    "volatility",
    "variability",
    "consistency",
    "inconsistency",
    "coherence",
    "incoherence",
    "continuity",
    "discontinuity",
    "change",
    "transformation",
    "evolution",
    "revolution",
    "disruption",
    "innovation",
    "improvement",
    "enhancement",
    "optimization",
    "refinement",
    "iteration",
    "increment",
    "decrement",
    "increase",
    "decrease",
    "growth",
    "decline",
    "expansion",
    "contraction",
    "inflation",
    "deflation",
    "recession",
    "depression",
    "recovery",
    "boom",
    "bust",
    "cycle",
    "phase",
    "stage",
    "step",
    "level",
    "tier",
    "layer",
    "hierarchy",
    "structure",
    "organization",
    "system",
    "framework",
    "architecture",
    "design",
    "layout",
    "composition",
    "arrangement",
    "configuration",
    "formation",
    "construction",
    "building",
    "development",
    "creation",
    "generation",
    "production",
    "manufacturing",
    "fabrication",
    "assembly",
    "integration",
    "implementation",
    "deployment",
    "installation",
    "setup",
    "configuration",
    "customization",
    "personalization",
    "adaptation",
    "adjustment",
    "modification",
    "alteration",
    "change",
    "transformation",
    "conversion",
    "transition",
    "shift",
    "movement",
    "motion",
    "action",
    "activity",
    "operation",
    "function",
    "process",
    "procedure",
    "method",
    "technique",
    "approach",
    "strategy",
    "tactic",
    "maneuver",
    "move",
    "play",
    "gambit",
    "trick",
    "hack",
    "workaround",
    "solution",
    "fix",
    "patch",
    "update",
    "upgrade",
    "downgrade",
    "rollback",
    "reversion",
    "restoration",
    "recovery",
    "backup",
    "archive",
    "storage",
    "repository",
    "database",
    "warehouse",
    "library",
    "collection",
    "set",
    "group",
    "cluster",
    "category",
    "classification",
    "taxonomy",
    "ontology",
    "hierarchy",
    "tree",
    "graph",
    "network",
    "mesh",
    "grid",
    "matrix",
    "array",
    "vector",
    "list",
    "queue",
    "stack",
    "heap",
    "buffer",
    "cache",
    "memory",
    "storage",
    "disk",
    "drive",
    "device",
    "hardware",
    "software",
    "firmware",
    "middleware",
    "application",
    "program",
    "script",
    "code",
    "algorithm",
    "function",
    "method",
    "procedure",
    "routine",
    "subroutine",
    "module",
    "package",
    "library",
    "framework",
    "platform",
    "environment",
    "ecosystem",
    "infrastructure",
    "architecture",
    "design",
    "pattern",
    "model",
    "template",
    "prototype",
    "instance",
    "object",
    "class",
    "interface",
    "abstract",
    "concrete",
    "implementation",
    "specification",
    "contract",
    "agreement",
    "understanding",
    "arrangement",
    "deal",
    "transaction",
    "exchange",
    "transfer",
    "transmission",
    "communication",
    "message",
    "signal",
    "noise",
    "data",
    "information",
    "knowledge",
    "wisdom",
    "intelligence",
    "learning",
    "education",
    "training",
    "development",
    "growth",
    "maturity",
    "experience",
    "expertise",
    "skill",
    "ability",
    "capability",
    "capacity",
    "competence",
    "proficiency",
    "mastery",
    "virtuosity",
    "excellence",
    "perfection",
    "flawlessness",
    "impeccability",
    "precision",
    "accuracy",
    "correctness",
    "rightness",
    "validity",
    "soundness",
    "robustness",
    "resilience",
    "durability",
    "longevity",
    "permanence",
    "temporariness",
    "transience",
    "ephemerality",
    "volatility",
    "stability",
    "steadiness",
    "consistency",
    "reliability",
    "dependability",
    "trustworthiness",
    "credibility",
    "integrity",
    "honesty",
    "truthfulness",
    "authenticity",
    "genuineness",
    "realness",
    "reality",
    "actuality",
    "factuality",
    "objectivity",
    "subjectivity",
    "bias",
    "prejudice",
    "discrimination",
    "fairness",
    "justice",
    "equity",
    "equality",
    "inequality",
    "disparity",
    "difference",
    "similarity",
    "sameness",
    "identity",
    "uniqueness",
    "distinctiveness",
    "differentiation",
    "specialization",
    "generalization",
    "abstraction",
    "concreteness",
    "specificity",
    "detail",
    "granularity",
    "resolution",
    "fidelity",
    "quality",
    "grade",
    "class",
    "tier",
    "level",
    "rank",
    "status",
    "position",
    "role",
    "function",
    "purpose",
    "goal",
    "objective",
    "aim",
    "target",
    "destination",
    "end",
    "finish",
    "completion",
    "conclusion",
    "termination",
    "cessation",
    "stop",
    "halt",
    "pause",
    "break",
    "interruption",
    "disruption",
    "disturbance",
    "interference",
    "intervention",
    "mediation",
    "facilitation",
    "assistance",
    "help",
    "support",
    "aid",
    "service",
    "utility",
    "usefulness",
    "value",
    "worth",
    "merit",
    "desert",
    "credit",
    "recognition",
    "acknowledgment",
    "appreciation",
    "gratitude",
    "thankfulness",
    "gratefulness",
    "indebtedness",
    "obligation",
    "duty",
    "responsibility",
    "accountability",
    "liability",
    "culpability",
    "blame",
    "fault",
    "guilt",
    "innocence",
    "blamelessness",
    "faultlessness",
    "guiltlessness",
    "purity",
    "cleanliness",
    "hygiene",
    "sanitation",
    "health",
    "wellness",
    "fitness",
    "vitality",
    "vigor",
    "energy",
    "power",
    "strength",
    "force",
    "might",
    "potency",
    "effectiveness",
    "efficacy",
    "efficiency",
    "productivity",
    "output",
    "yield",
    "return",
    "profit",
    "gain",
    "benefit",
    "advantage",
    "edge",
    "lead",
    "superiority",
    "dominance",
    "supremacy",
    "hegemony",
    "authority",
    "control",
    "command",
    "mastery",
    "leadership",
    "guidance",
    "direction",
    "management",
    "administration",
    "governance",
    "government",
    "state",
    "nation",
    "country",
    "land",
    "territory",
    "region",
    "area",
    "zone",
    "sector",
    "district",
    "neighborhood",
    "community",
    "society",
    "culture",
    "civilization",
    "humanity",
    "mankind",
    "humankind",
    "people",
    "population",
    "demographic",
    "audience",
    "market",
    "segment",
    "niche",
    "target",
    "customer",
    "client",
    "user",
    "consumer",
    "buyer",
    "seller",
    "vendor",
    "supplier",
    "provider",
    "producer",
    "manufacturer",
    "creator",
    "author",
    "artist",
    "designer",
    "developer",
    "engineer",
    "architect",
    "builder",
    "constructor",
    "maker",
    "craftsman",
    "artisan",
    "technician",
    "specialist",
    "expert",
    "professional",
    "amateur",
    "hobbyist",
    "enthusiast",
    "fan",
    "follower",
    "supporter",
    "advocate",
    "promoter",
    "ambassador",
    "representative",
    "delegate",
    "agent",
    "broker",
    "intermediary",
    "mediator",
    "negotiator",
    "arbitrator",
    "judge",
    "referee",
    "umpire",
    "critic",
    "reviewer",
    "evaluator",
    "assessor",
    "appraiser",
    "estimator",
    "calculator",
    "computer",
    "processor",
    "server",
    "client",
    "host",
    "guest",
    "visitor",
    "stranger",
    "acquaintance",
    "friend",
    "ally",
    "partner",
    "associate",
    "colleague",
    "coworker",
    "teammate",
    "collaborator",
    "competitor",
    "rival",
    "opponent",
    "adversary",
    "enemy",
    "foe",
    "antagonist",
    "protagonist",
    "hero",
    "villain",
    "character",
    "persona",
    "identity",
    "self",
    "individual",
    "person",
    "human",
    "being",
    "creature",
    "organism",
    "life",
    "existence",
    "reality",
    "world",
    "universe",
    "cosmos",
    "nature",
    "environment",
    "ecology",
    "ecosystem",
    "biosphere",
    "atmosphere",
    "climate",
    "weather",
    "temperature",
    "pressure",
    "humidity",
    "precipitation",
    "rain",
    "snow",
    "sleet",
    "hail",
    "fog",
    "mist",
    "cloud",
    "sky",
    "heaven",
    "paradise",
    "utopia",
    "dystopia",
    "hell",
    "purgatory",
    "limbo",
    "void",
    "abyss",
    "chasm",
    "gap",
    "space",
    "interval",
    "distance",
    "proximity",
    "closeness",
    "nearness",
    "farness",
    "remoteness",
    "isolation",
    "separation",
    "connection",
    "link",
    "relationship",
    "association",
    "correlation",
    "causation",
    "cause",
    "effect",
    "consequence",
    "result",
    "outcome",
    "output",
    "product",
    "service",
    "good",
    "commodity",
    "merchandise",
    "ware",
    "stock",
    "inventory",
    "supply",
    "demand",
    "market",
    "economy",
    "industry",
    "sector",
    "business",
    "commerce",
    "trade",
    "exchange",
    "transaction",
    "deal",
    "bargain",
    "sale",
    "purchase",
    "acquisition",
    "procurement",
    "sourcing",
    "outsourcing",
    "insourcing",
    "offshoring",
    "nearshoring",
    "reshoring",
    "onshoring",
    "globalization",
    "localization",
    "internationalization",
    "nationalization",
    "privatization",
    "deregulation",
    "liberalization",
    "protectionism",
    "isolationism",
    "interventionism",
    "capitalism",
    "socialism",
    "communism",
    "fascism",
    "democracy",
    "republic",
    "monarchy",
    "aristocracy",
    "oligarchy",
    "plutocracy",
    "technocracy",
    "meritocracy",
    "bureaucracy",
    "autocracy",
    "dictatorship",
    "totalitarianism",
    "authoritarianism",
    "libertarianism",
    "conservatism",
    "liberalism",
    "progressivism",
    "radicalism",
    "extremism",
    "centrism",
    "moderatism",
    "pragmatism",
    "idealism",
    "realism",
    "materialism",
    "spiritualism",
    "religion",
    "faith",
    "belief",
    "creed",
    "doctrine",
    "dogma",
    "ideology",
    "philosophy",
    "ethics",
    "morality",
    "virtue",
    "vice",
    "sin",
    "crime",
    "offense",
    "violation",
    "transgression",
    "infraction",
    "breach",
    "infringement",
    "trespass",
    "intrusion",
    "invasion",
    "incursion",
    "raid",
    "attack",
    "assault",
    "strike",
    "hit",
    "blow",
    "punch",
    "kick",
    "slap",
    "smack",
    "whack",
    "bash",
    "slam",
    "crash",
    "collision",
    "impact",
    "force",
    "pressure",
    "stress",
    "strain",
    "tension",
    "compression",
    "torsion",
    "bending",
    "flexing",
    "stretching",
    "shrinking",
    "expanding",
    "growing",
    "diminishing",
    "increasing",
    "decreasing",
    "rising",
    "falling",
    "climbing",
    "descending",
    "ascending",
    "mounting",
    "scaling",
    "soaring",
    "plummeting",
    "diving",
    "plunging",
    "sinking",
    "drowning",
    "floating",
    "swimming",
    "flying",
    "gliding",
    "sailing",
    "cruising",
    "traveling",
    "journeying",
    "voyaging",
    "exploring",
    "discovering",
    "finding",
    "locating",
    "identifying",
    "recognizing",
    "knowing",
    "understanding",
    "comprehending",
    "grasping",
    "learning",
    "studying",
    "researching",
    "investigating",
    "examining",
    "analyzing",
    "dissecting",
    "breaking",
    "fixing",
    "repairing",
    "mending",
    "healing",
    "curing",
    "treating",
    "diagnosing",
    "prescribing",
    "medicating",
    "drugging",
    "poisoning",
    "killing",
    "murdering",
    "assassinating",
    "executing",
    "slaughtering",
    "massacring",
    "genociding",
    "exterminating",
    "annihilating",
    "destroying",
    "demolishing",
    "razing",
    "leveling",
    "flattening",
    "crushing",
    "smashing",
    "breaking",
    "shattering",
    "splintering",
    "fragmenting",
    "disintegrating",
    "dissolving",
    "melting",
    "freezing",
    "solidifying",
    "hardening",
    "softening",
    "weakening",
    "strengthening",
    "reinforcing",
    "fortifying",
    "defending",
    "protecting",
    "guarding",
    "securing",
    "safeguarding",
    "preserving",
    "conserving",
    "saving",
    "rescuing",
    "liberating",
    "freeing",
    "releasing",
    "discharging",
    "emitting",
    "radiating",
    "shining",
    "glowing",
    "burning",
    "combusting",
    "oxidizing",
    "reducing",
    "catalyzing",
    "accelerating",
    "decelerating",
    "slowing",
    "stopping",
    "halting",
    "ceasing",
    "ending",
    "finishing",
    "completing",
    "concluding",
    "terminating",
    "closing",
    "opening",
    "beginning",
    "starting",
    "initiating",
    "launching",
    "inaugurating",
    "commencing",
    "embarking",
    "undertaking",
    "attempting",
    "trying",
    "testing",
    "experimenting",
    "piloting",
    "prototyping",
    "modeling",
    "simulating",
    "emulating",
    "imitating",
    "copying",
    "duplicating",
    "replicating",
    "cloning",
    "reproducing",
    "breeding",
    "multiplying",
    "dividing",
    "adding",
    "subtracting",
    "multiplying",
    "dividing",
    "calculating",
    "computing",
    "processing",
    "analyzing",
    "synthesizing",
    "creating",
    "inventing",
    "innovating",
    "pioneering",
    "trailblazing",
    "groundbreaking",
    "revolutionary",
    "evolutionary",
    "transformative",
    "disruptive",
    "game-changing",
    "paradigm-shifting",
    "mind-blowing",
    "awe-inspiring",
    "breathtaking",
    "stunning",
    "amazing",
    "astonishing",
    "astounding",
    "surprising",
    "shocking",
    "startling",
    "alarming",
    "frightening",
    "terrifying",
    "horrifying",
    "petrifying",
    "paralyzing",
    "immobilizing",
    "freezing",
    "chilling",
    "cooling",
    "warming",
    "heating",
    "boiling",
    "evaporating",
    "condensing",
    "precipitating",
    "raining",
    "snowing",
    "hailing",
    "sleeting",
    "storming",
    "thundering",
    "lightning",
    "flashing",
    "sparking",
    "igniting",
    "kindling",
    "fueling",
    "powering",
    "energizing",
    "activating",
    "stimulating",
    "exciting",
    "thrilling",
    "exhilarating",
    "invigorating",
    "refreshing",
    "rejuvenating",
    "revitalizing",
    "restoring",
    "rehabilitating",
    "recovering",
    "healing",
    "mending",
    "fixing",
    "repairing",
    "maintaining",
    "servicing",
    "overhauling",
    "rebuilding",
    "reconstructing",
    "renovating",
    "remodeling",
    "refurbishing",
    "refining",
    "polishing",
    "smoothing",
    "roughening",
    "texturing",
    "patterning",
    "designing",
    "styling",
    "fashioning",
    "trending",
    "popularizing",
    "mainstreaming",
    "normalizing",
    "standardizing",
    "regulating",
    "controlling",
    "managing",
    "administering",
    "governing",
    "ruling",
    "reigning",
    "presiding",
    "leading",
    "guiding",
    "directing",
    "steering",
    "navigating",
    "piloting",
    "driving",
    "riding",
    "walking",
    "running",
    "jogging",
    "sprinting",
    "racing",
    "competing",
    "contesting",
    "challenging",
    "testing",
    "trying",
    "attempting",
    "succeeding",
    "failing",
    "winning",
    "losing",
    "drawing",
    "tying",
    "equalizing",
    "balancing",
    "harmonizing",
    "synchronizing",
    "coordinating",
    "organizing",
    "arranging",
    "ordering",
    "sorting",
    "classifying",
    "categorizing",
    "grouping",
    "clustering",
    "gathering",
    "collecting",
    "accumulating",
    "amassing",
    "hoarding",
    "storing",
    "saving",
    "investing",
    "spending",
    "consuming",
    "using",
    "utilizing",
    "employing",
    "applying",
    "implementing",
    "executing",
    "performing",
    "doing",
    "acting",
    "behaving",
    "conducting",
    "carrying",
    "bearing",
    "holding",
    "containing",
    "including",
    "excluding",
    "omitting",
    "skipping",
    "missing",
    "lacking",
    "needing",
    "wanting",
    "desiring",
    "craving",
    "yearning",
    "longing",
    "pining",
    "aching",
    "hurting",
    "paining",
    "suffering",
    "agonizing",
    "torturing",
    "tormenting",
    "persecuting",
    "oppressing",
    "suppressing",
    "repressing",
    "inhibiting",
    "restraining",
    "constraining",
    "limiting",
    "restricting",
    "confining",
    "imprisoning",
    "incarcerating",
    "detaining",
    "arresting",
    "capturing",
    "seizing",
    "taking",
    "grabbing",
    "clutching",
    "grasping",
    "gripping",
    "holding",
    "releasing",
    "freeing",
    "liberating",
    "emancipating",
    "delivering",
    "saving",
    "rescuing",
    "helping",
    "assisting",
    "aiding",
    "supporting",

    '  "optimistic',
    "hopeful",
    "confident",
    "assured",
    "certain",
    "sure",
    "positive",
    "definite",
    "absolute",
  ]

  // Reset form data when asset changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: asset?.id || "",
        name: asset?.name || "",
        description: asset?.description || "",
        type: asset?.type || "image",
        size: asset?.size || 0,
        url: asset?.url || "",
        tags: asset?.tags || [],
        createdBy: asset?.createdBy || mockUsers[0],
        createdAt: asset?.createdAt || new Date(),
        comments: asset?.comments || [],
        relatedBriefs: asset?.relatedBriefs || [],
      })

      setPreviewFile(null)
    }
  }, [asset, isOpen])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // If we have a preview file, use that URL
    const finalFormData = { ...formData }
    if (previewFile) {
      finalFormData.url = previewFile.url
      finalFormData.type = previewFile.type
      finalFormData.size = previewFile.size
    }

    onSave(finalFormData)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleAddComment = (comment, mentionedUsers = []) => {
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      user: mockUsers[0], // Current user
      createdAt: new Date(),
      mentions: mentionedUsers,
    }

    setFormData((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file)

    // Determine file type
    const fileType = file.type.split("/")[0]

    // Update form data
    setFormData((prev) => ({
      ...prev,
      name: file.name,
    }))

    // Set preview file
    setPreviewFile({
      name: file.name,
      type: fileType,
      size: file.size,
      url: fileUrl,
      file: file,
    })
  }

  const toggleBriefRelation = (briefId) => {
    setFormData((prev) => {
      const isRelated = prev.relatedBriefs.includes(briefId)

      if (isRelated) {
        return {
          ...prev,
          relatedBriefs: prev.relatedBriefs.filter((id) => id !== briefId),
        }
      } else {
        return {
          ...prev,
          relatedBriefs: [...prev.relatedBriefs, briefId],
        }
      }
    })
  }

  const filteredTags = allPossibleTags
    .filter((tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !formData.tags.includes(tag))
    .slice(0, 5)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {asset ? (
              <>
                <span>Asset Details:</span>
                <span className="font-normal">{formData.name}</span>
              </>
            ) : (
              "Upload New Asset"
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!asset && !previewFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-medium text-lg">Drag & drop file here</h3>
                <p className="text-sm text-muted-foreground mb-4">or click to browse files from your computer</p>
                <Button variant="outline" onClick={() => inputRef.current.click()}>
                  Choose File
                </Button>
                <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
          )}

          {(asset || previewFile) && (
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  {asset?.type === "image" || previewFile?.type === "image" ? (
                    <div className="relative w-full h-64 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={previewFile?.url || asset?.url || "/placeholder.svg"}
                        alt={formData.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center bg-muted rounded-lg">
                      <FileIcon className="h-16 w-16 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">{previewFile?.name || asset?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(previewFile?.size || asset?.size || 0)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Asset Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter asset name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Enter asset description"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex flex-col space-y-2">
                  <TokenizedSelect
                    placeholder="Add tags..."
                    options={allPossibleTags.map((tag) => ({ value: tag, label: tag }))}
                    value={formData.tags}
                    onChange={(value) => handleChange("tags", Array.isArray(value) ? value : [value])}
                    searchPlaceholder="Search tags..."
                    multiSelect={true}
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">File Type</Label>
                  <div className="font-medium mt-1">{previewFile?.type || asset?.type || "Unknown"}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">File Size</Label>
                  <div className="font-medium mt-1">{formatFileSize(previewFile?.size || asset?.size || 0)}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Created By</Label>
                  <div className="font-medium mt-1 flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={formData.createdBy?.avatar || "/placeholder.svg"}
                        alt={formData.createdBy?.name}
                      />
                      <AvatarFallback>{formData.createdBy?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {formData.createdBy?.name}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Created At</Label>
                  <div className="font-medium mt-1">{formatDate(formData.createdAt)}</div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Related Briefs</Label>
                <TokenizedSelect
                  placeholder="Link briefs..."
                  options={mockBriefs.map((brief) => ({
                    value: brief.id,
                    label: brief.title,
                    icon: (
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[10px]"
                        style={{ backgroundColor: getStatusColorForBadge(brief.status) }}
                      >
                        {brief.status}
                      </span>
                    ),
                  }))}
                  value={formData.relatedBriefs}
                  onChange={(value) => handleChange("relatedBriefs", Array.isArray(value) ? value : [value])}
                  searchPlaceholder="Search briefs..."
                  multiSelect={true}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Comments</Label>
                <EnhancedCommentSection comments={formData.comments} onAddComment={handleAddComment} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || (!asset && !previewFile)}>
            {asset ? "Save Changes" : "Upload Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "draft":
      return "bg-yellow-100 text-yellow-800"
    case "review":
      return "bg-blue-100 text-blue-800"
    case "approved":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
