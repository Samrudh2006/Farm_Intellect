/**
 * Site Routes Configuration with SEO Metadata
 * Centralized route definitions with metadata for SEO, sitemap generation, and breadcrumbs
 */

import { PageMetadata } from "./seoHelper";

export interface RouteConfig extends PageMetadata {
  path: string;
  priority?: number; // 0.0-1.0 for sitemap
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  requiresAuth?: boolean;
  roles?: ("farmer" | "merchant" | "expert" | "admin")[];
  children?: RouteConfig[];
}

// Base site routes with SEO metadata
export const siteRoutes: RouteConfig[] = [
  {
    path: "/",
    title: "Farm-Intellect - AI-Powered Agricultural Platform",
    description: "Transform farming with AI-powered insights. Get crop recommendations, weather forecasts, market prices, and expert guidance all in one platform.",
    keywords: ["agriculture", "farming", "AI", "crop prediction", "farm management"],
    priority: 1.0,
    changefreq: "daily",
  },
  {
    path: "/login",
    title: "Login",
    description: "Sign in to your Farm-Intellect account to access personalized agricultural insights and tools.",
    priority: 0.8,
    changefreq: "monthly",
  },
  {
    path: "/app",
    title: "Open App",
    description: "Install Farm Intellect and open it like a native mobile application.",
    priority: 0.4,
    changefreq: "monthly",
  },
  {
    path: "/launch",
    title: "Open App",
    description: "Install Farm Intellect and open it like a native mobile application.",
    priority: 0.4,
    changefreq: "monthly",
  },
  {
    path: "/reset-password",
    title: "Reset Password",
    description: "Reset your Farm-Intellect account password.",
    priority: 0.5,
    changefreq: "yearly",
  },
  {
    path: "/sms-register",
    title: "SMS Registration",
    description: "Register for Farm-Intellect using SMS.",
    priority: 0.6,
    changefreq: "monthly",
  },

  // Farmer Routes
  {
    path: "/farmer",
    title: "Farmer Dashboard",
    description: "Manage your farm operations with AI-powered insights and recommendations.",
    requiresAuth: true,
    roles: ["farmer"],
    children: [
      {
        path: "/farmer/dashboard",
        title: "Farmer Dashboard",
        description: "View your farm overview, recent activities, and key metrics.",
        priority: 0.9,
        changefreq: "daily",
      },
      {
        path: "/farmer/crops",
        title: "My Crops",
        description: "Manage and monitor your crops with detailed analytics and recommendations.",
        priority: 0.8,
        changefreq: "daily",
      },
      {
        path: "/farmer/advisory",
        title: "Advisory",
        description: "Get agricultural advisory and expert guidance for your crops.",
        priority: 0.8,
        changefreq: "daily",
      },
      {
        path: "/farmer/weather",
        title: "Weather Forecast",
        description: "Check weather forecasts and alerts for your farm location.",
        priority: 0.8,
        changefreq: "hourly",
      },
      {
        path: "/farmer/sensors",
        title: "Sensors",
        description: "Monitor IoT sensors and real-time data from your fields.",
        priority: 0.7,
        changefreq: "daily",
      },
      {
        path: "/farmer/field-map",
        title: "Field Map",
        description: "Interactive field mapping and management tools.",
        priority: 0.7,
        changefreq: "weekly",
      },
      {
        path: "/farmer/merchants",
        title: "Merchants",
        description: "Connect with merchants for market opportunities.",
        priority: 0.7,
        changefreq: "daily",
      },
      {
        path: "/farmer/polls",
        title: "Polls & Surveys",
        description: "Participate in agricultural surveys and polls.",
        priority: 0.6,
        changefreq: "weekly",
      },
      {
        path: "/farmer/schemes",
        title: "Government Schemes",
        description: "Explore and apply for government agricultural schemes.",
        priority: 0.7,
        changefreq: "monthly",
      },
      {
        path: "/farmer/features",
        title: "Smart Farm Features",
        description: "Access advanced farmer capabilities, voice assistance, alerts, and personalized tools.",
        priority: 0.7,
        changefreq: "weekly",
      },
      {
        path: "/farmer/ai-advisory",
        title: "AI Advisory",
        description: "Get AI-powered agricultural advisory and recommendations.",
        priority: 0.8,
        changefreq: "daily",
      },
      {
        path: "/farmer/ai-crop-scanner",
        title: "AI Crop Scanner",
        description: "Scan your crops for disease detection and analysis.",
        priority: 0.8,
        changefreq: "daily",
      },
      {
        path: "/farmer/knowledge",
        title: "Knowledge Hub",
        description: "Access educational resources and best practices.",
        priority: 0.7,
        changefreq: "weekly",
      },
      {
        path: "/farmer/forum",
        title: "Community Forum",
        description: "Connect and discuss with other farmers in the community.",
        priority: 0.6,
        changefreq: "daily",
      },
      {
        path: "/farmer/calendar",
        title: "Farm Calendar",
        description: "Manage your farm activities and important dates.",
        priority: 0.6,
        changefreq: "daily",
      },
      {
        path: "/farmer/documents",
        title: "Documents",
        description: "Store and manage your farm documents.",
        priority: 0.6,
        changefreq: "weekly",
      },
      {
        path: "/farmer/chat",
        title: "Chat",
        description: "Connect with experts and support team.",
        priority: 0.6,
        changefreq: "daily",
      },
      {
        path: "/farmer/call",
        title: "Farmer Call",
        description: "Join voice and video consultations for real-time support.",
        priority: 0.5,
        changefreq: "daily",
      },
      {
        path: "/farmer/profile",
        title: "Farmer Profile",
        description: "Manage farmer account details, preferences, and profile settings.",
        priority: 0.6,
        changefreq: "weekly",
      },
      {
        path: "/farmer/notifications",
        title: "Notifications",
        description: "View your alerts and notifications.",
        priority: 0.5,
        changefreq: "hourly",
      },
    ],
  },

  // Merchant Routes
  {
    path: "/merchant",
    title: "Merchant Dashboard",
    description: "Manage your merchant operations and connect with farmers.",
    requiresAuth: true,
    roles: ["merchant"],
    children: [
      {
        path: "/merchant/dashboard",
        title: "Merchant Dashboard",
        description: "View your merchant overview and key metrics.",
        priority: 0.9,
        changefreq: "daily",
      },
      {
        path: "/merchant/farmers",
        title: "Connected Farmers",
        description: "Manage relationships with farmers in your network.",
        priority: 0.8,
        changefreq: "daily",
      },
      {
        path: "/merchant/market-prices",
        title: "Market Prices",
        description: "Track market prices and trends for agricultural products.",
        priority: 0.8,
        changefreq: "hourly",
      },
      {
        path: "/merchant/orders",
        title: "Orders",
        description: "Manage your orders and transactions.",
        priority: 0.8,
        changefreq: "daily",
      },
      {
        path: "/merchant/documents",
        title: "Documents",
        description: "Store and manage business documents.",
        priority: 0.6,
        changefreq: "weekly",
      },
      {
        path: "/merchant/chat",
        title: "Chat",
        description: "Connect with farmers and support team.",
        priority: 0.6,
        changefreq: "daily",
      },
      {
        path: "/merchant/notifications",
        title: "Notifications",
        description: "View your alerts and notifications.",
        priority: 0.5,
        changefreq: "hourly",
      },
      {
        path: "/merchant/profile",
        title: "Merchant Profile",
        description: "Manage merchant profile details and account preferences.",
        priority: 0.6,
        changefreq: "weekly",
      },
    ],
  },

  // Expert Routes
  {
    path: "/expert",
    title: "Expert Dashboard",
    description: "Manage your expertise and consultations.",
    requiresAuth: true,
    roles: ["expert"],
    children: [
      {
        path: "/expert/dashboard",
        title: "Expert Dashboard",
        description: "View your expert profile and activities.",
        priority: 0.9,
        changefreq: "daily",
      },
      {
        path: "/expert/consultations",
        title: "Consultations",
        description: "Manage farmer consultations and advisory sessions.",
        priority: 0.8,
        changefreq: "daily",
      },
      {
        path: "/expert/ai-advisory",
        title: "AI Advisory",
        description: "Generate AI-powered agricultural recommendations.",
        priority: 0.8,
        changefreq: "daily",
      },
      {
        path: "/expert/ai-crop-scanner",
        title: "AI Crop Scanner",
        description: "Analyze crops for diseases and issues.",
        priority: 0.8,
        changefreq: "daily",
      },
      {
        path: "/expert/knowledge",
        title: "Knowledge Hub",
        description: "Share and manage agricultural knowledge resources.",
        priority: 0.7,
        changefreq: "weekly",
      },
      {
        path: "/expert/chat",
        title: "Chat",
        description: "Connect with farmers and other experts.",
        priority: 0.6,
        changefreq: "daily",
      },
      {
        path: "/expert/notifications",
        title: "Notifications",
        description: "View your alerts and notifications.",
        priority: 0.5,
        changefreq: "hourly",
      },
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    title: "Admin Dashboard",
    description: "Manage platform administration and analytics.",
    requiresAuth: true,
    roles: ["admin"],
    children: [
      {
        path: "/admin/dashboard",
        title: "Admin Dashboard",
        description: "View platform analytics and statistics.",
        priority: 0.7,
        changefreq: "daily",
      },
      {
        path: "/admin/users",
        title: "User Management",
        description: "Manage platform users and accounts.",
        priority: 0.7,
        changefreq: "daily",
      },
      {
        path: "/admin/analytics",
        title: "Analytics",
        description: "View platform-wide analytics and reports.",
        priority: 0.7,
        changefreq: "daily",
      },
      {
        path: "/admin/settings",
        title: "Admin Settings",
        description: "Configure platform settings and preferences.",
        priority: 0.6,
        changefreq: "monthly",
      },
      {
        path: "/admin/audit-log",
        title: "Audit Log",
        description: "View system audit and activity logs.",
        priority: 0.6,
        changefreq: "daily",
      },
      {
        path: "/admin/chat",
        title: "Admin Chat",
        description: "Admin communication and support.",
        priority: 0.5,
        changefreq: "daily",
      },
      {
        path: "/admin/notifications",
        title: "Admin Notifications",
        description: "View admin alerts and notifications.",
        priority: 0.5,
        changefreq: "hourly",
      },
      {
        path: "/admin/sms",
        title: "SMS Management",
        description: "Manage SMS communications.",
        priority: 0.6,
        changefreq: "weekly",
      },
    ],
  },

  // General authenticated routes
  {
    path: "/profile",
    title: "My Profile",
    description: "Manage your profile and account settings.",
    requiresAuth: true,
    priority: 0.6,
    changefreq: "weekly",
  },
  {
    path: "/settings",
    title: "Settings",
    description: "Configure your preferences and settings.",
    requiresAuth: true,
    priority: 0.6,
    changefreq: "monthly",
  },
];

/**
 * Get metadata for a specific route path
 */
export function getRouteMetadata(path: string): PageMetadata | null {
  const findRoute = (routes: RouteConfig[]): RouteConfig | null => {
    for (const route of routes) {
      if (route.path === path) return route;
      if (route.children) {
        const found = findRoute(route.children);
        if (found) return found;
      }
    }
    return null;
  };

  return findRoute(siteRoutes) || null;
}

/**
 * Get all public routes for sitemap generation
 */
export function getPublicRoutes(routes = siteRoutes): RouteConfig[] {
  const publicRoutes: RouteConfig[] = [];

  function traverse(routeList: RouteConfig[]) {
    for (const route of routeList) {
      if (!route.requiresAuth) {
        publicRoutes.push(route);
      }
      if (route.children) {
        traverse(route.children);
      }
    }
  }

  traverse(routes);
  return publicRoutes;
}

/**
 * Generate breadcrumb items for a route path
 */
export function generateBreadcrumbs(path: string): Array<{ name: string; url: string }> {
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: "Home", url: "/" },
  ];

  const parts = path.split("/").filter(Boolean);
  let currentPath = "";

  for (const part of parts) {
    currentPath += `/${part}`;
    const metadata = getRouteMetadata(currentPath);
    if (metadata) {
      breadcrumbs.push({
        name: metadata.title,
        url: currentPath,
      });
    }
  }

  return breadcrumbs;
}
