export const mockProducts = [
  "Website Redesign",
  "Mobile App",
  "Marketing Campaign",
  "Social Media",
  "Email Newsletter",
  "Product Launch",
  "Brand Identity",
  "Video Production",
]

export const mockObjectives = [
  "Increase Awareness",
  "Generate Leads",
  "Drive Sales",
  "Improve Retention",
  "Build Brand Loyalty",
  "Educate Customers",
  "Launch New Product",
  "Expand Market Share",
]

export const mockUsers = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/thoughtful-alex.png",
    role: "admin",
    status: "active",
    department: "Marketing",
    position: "Marketing Director",
    phone: "+1 (555) 123-4567",
    bio: "Marketing professional with 10+ years of experience in digital marketing and brand strategy.",
  },
  {
    id: "2",
    name: "Sam Wilson",
    email: "sam@example.com",
    avatar: "/thoughtful-portrait.png",
    role: "manager",
    status: "active",
    department: "Creative",
    position: "Creative Director",
    phone: "+1 (555) 234-5678",
    bio: "Creative director specializing in brand identity and visual storytelling.",
  },
  {
    id: "3",
    name: "Taylor Smith",
    email: "taylor@example.com",
    avatar: "/singer-songwriter-stage.png",
    role: "user",
    status: "active",
    department: "Content",
    position: "Content Strategist",
    phone: "+1 (555) 345-6789",
    bio: "Content strategist with a background in journalism and digital media.",
  },
  {
    id: "4",
    name: "Jordan Lee",
    email: "jordan@example.com",
    avatar: "/Petra-canyon.png",
    role: "user",
    status: "inactive",
    department: "Design",
    position: "UI/UX Designer",
    phone: "+1 (555) 456-7890",
    bio: "UI/UX designer focused on creating intuitive and accessible digital experiences.",
  },
  {
    id: "5",
    name: "Casey Brown",
    email: "casey@example.com",
    avatar: "/thoughtful-artist.png",
    role: "manager",
    status: "active",
    department: "Production",
    position: "Production Manager",
    phone: "+1 (555) 567-8901",
    bio: "Production manager with expertise in project management and team coordination.",
  },
  {
    id: "6",
    name: "John Doe",
    email: "john@example.com",
    avatar: "/thoughtful-alex.png",
    role: "admin",
  },
  {
    id: "7",
    name: "Jane Doe",
    email: "jane@example.com",
    avatar: "/thoughtful-alex.png",
    role: "admin",
  },
  {
    id: "8",
    name: "John Doe",
    email: "john@example.com",
    avatar: "/thoughtful-alex.png",
    role: "admin",
  },
]

export const mockBriefs = [
  {
    id: "1",
    title: "Q4 Holiday Campaign",
    product: "Marketing Campaign",
    objective: "Drive Sales",
    targetAudience: "Existing customers aged 25-45 interested in premium products",
    hookAngle: "Celebrate the season with exclusive offers that bring joy to your loved ones",
    goLive: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: "Draft",
    assignedTo: [mockUsers[0], mockUsers[1]],
    assets: ["asset1", "asset2"],
    relatedBriefs: ["2", "5"],
    comments: [
      {
        id: "c1",
        text: "Let's focus on personalized recommendations based on purchase history.",
        user: mockUsers[2],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ],
    tags: ["holiday", "sales", "premium"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "2",
    title: "Mobile App Onboarding Redesign",
    product: "Mobile App",
    objective: "Improve Retention",
    targetAudience: "New app users who downloaded but haven't completed setup",
    hookAngle: "Simplified onboarding that gets users to their first success moment in under 60 seconds",
    goLive: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    status: "Review",
    assignedTo: [mockUsers[1], mockUsers[3]],
    assets: ["asset3"],
    relatedBriefs: ["1"],
    comments: [],
    tags: ["mobile", "ux", "onboarding"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "3",
    title: "Brand Refresh Social Campaign",
    product: "Social Media",
    objective: "Increase Awareness",
    targetAudience: "Gen Z and Millennials in urban areas",
    hookAngle: "Showcasing our brand values through authentic stories from real customers",
    goLive: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: "Approved",
    assignedTo: [mockUsers[2], mockUsers[4]],
    assets: ["asset4", "asset5"],
    relatedBriefs: [],
    comments: [
      {
        id: "c2",
        text: "The creative direction looks great! Let's make sure we have diverse representation.",
        user: mockUsers[0],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        id: "c3",
        text: "Agreed. I've added some additional casting notes to the brief.",
        user: mockUsers[4],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ],
    tags: ["social", "brand", "awareness"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: "4",
    title: "Product Launch Email Sequence",
    product: "Email Newsletter",
    objective: "Launch New Product",
    targetAudience: "Existing customers who have purchased similar products",
    hookAngle: "Be the first to experience our most innovative product yet",
    goLive: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: "Draft",
    assignedTo: [mockUsers[0], mockUsers[4]],
    assets: [],
    relatedBriefs: ["5"],
    comments: [],
    tags: ["email", "product launch", "sequence"],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
  {
    id: "5",
    title: "Website Homepage Redesign",
    product: "Website Redesign",
    objective: "Improve Retention",
    targetAudience: "All website visitors, with focus on improving conversion rate",
    hookAngle: "A cleaner, faster experience that helps users find exactly what they need",
    goLive: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    status: "Review",
    assignedTo: [mockUsers[1], mockUsers[3], mockUsers[4]],
    assets: ["asset6"],
    relatedBriefs: ["1", "4"],
    comments: [
      {
        id: "c4",
        text: "The wireframes look good. Can we add more emphasis on the CTA?",
        user: mockUsers[1],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    ],
    tags: ["website", "ux", "conversion"],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
]

export const mockAssets = [
  {
    id: "asset1",
    name: "Holiday Banner.jpg",
    description: "Main banner for the holiday campaign",
    type: "image",
    size: 1024000, // 1MB
    url: "/festive-winter-banner.png",
    tags: ["holiday", "banner", "campaign"],
    createdBy: mockUsers[0],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    comments: [
      {
        id: "ac1",
        text: "Can we make the text more prominent?",
        user: mockUsers[1],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    ],
    relatedBriefs: ["1"],
  },
  {
    id: "asset2",
    name: "Product Catalog.pdf",
    description: "Holiday product catalog with pricing",
    type: "document",
    size: 3145728, // 3MB
    url: "/ancient-scroll.png",
    tags: ["catalog", "products", "pricing"],
    createdBy: mockUsers[1],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    comments: [],
    relatedBriefs: ["1"],
  },
  {
    id: "asset3",
    name: "App Onboarding Screens.png",
    description: "Mockups of the new onboarding flow",
    type: "image",
    size: 2097152, // 2MB
    url: "/modern-app-interface.png",
    tags: ["mobile", "onboarding", "ux"],
    createdBy: mockUsers[3],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    comments: [
      {
        id: "ac2",
        text: "These look great! Can we add a progress indicator?",
        user: mockUsers[1],
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      },
    ],
    relatedBriefs: ["2"],
  },
  {
    id: "asset4",
    name: "Brand Story Video.mp4",
    description: "Customer testimonial video for social campaign",
    type: "video",
    size: 15728640, // 15MB
    url: "/abstract-thumbnail.png",
    tags: ["video", "testimonial", "social"],
    createdBy: mockUsers[2],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    comments: [],
    relatedBriefs: ["3"],
  },
  {
    id: "asset5",
    name: "Social Media Graphics.zip",
    description: "Package of graphics for various social platforms",
    type: "document",
    size: 5242880, // 5MB
    url: "/digital-art-palette.png",
    tags: ["social", "graphics", "zip"],
    createdBy: mockUsers[4],
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
    comments: [],
    relatedBriefs: ["3"],
  },
  {
    id: "asset6",
    name: "Homepage Wireframes.jpg",
    description: "Wireframes for the new homepage design",
    type: "image",
    size: 1572864, // 1.5MB
    url: "/placeholder.svg?height=400&width=800&query=website+wireframe",
    tags: ["website", "wireframe", "design"],
    createdBy: mockUsers[1],
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
    comments: [
      {
        id: "ac3",
        text: "I like the layout. Let's discuss the hero section in our next meeting.",
        user: mockUsers[4],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
    ],
    relatedBriefs: ["5"],
  },
]
