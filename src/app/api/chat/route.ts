import { NextRequest, NextResponse } from "next/server";

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || "";
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || "";
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1-mini";
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

const CALENDAR_IDS = [
  "c_56a6e0c46fa5f864d1689c4c64d903df60090f3748e6c8f8fe373fb5fb5ba73c",
  "c_006dcca0d08d706b39da31d4f09a25289f56c71d50be6fbd027631cd21fba6e5",
  "c_09e72818dd2eee3e5af4a59b53842a559ef129e64601d195e254c733021c979",
  "c_12c0c33444baf1460937e3ffe666d0db8e4270b7afc3e2dc38d8351a489997b4",
  "c_5f03a325a4b60f2572185205aa8a0cb5e9feff5db62aa03d67470f08061fc95d",
  "c_8afaaf875b76d8dd4fcbb69fd2e68759f41679e43e7d75a27b84d4f6758348f6",
  "c_ad213ef183b68d1376a7d5f73fae7f2bafd88240bc5e8c29af91fff6731df93f",
  "c_afa76cbdf84dbd4a161f0bc911d79ce6e2454b3066edc22997431367b543b823",
];

async function fetchFormerVicarsDetails(baseUrl: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}/api/about/former-vicars`, { cache: "no-store" });
    if (!res.ok) return "Former vicars details unavailable.";
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data
        .filter((vicar: any) => vicar.name)
        .map((vicar: any) => {
          const parts = [];
          if (vicar.name) parts.push(vicar.name);
          if (vicar.period) parts.push(`(${vicar.period})`);
          return `- ${parts.join(" ")}`;
        })
        .join("\n");
    }
    return "Former vicars details unavailable.";
  } catch {
    return "Former vicars details unavailable.";
  }
}

async function fetchAboutDetails(baseUrl: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}/api/about`, { cache: "no-store" });
    if (!res.ok) return "About details unavailable.";
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => {
        return Object.entries(item)
          .filter(([, value]) => value && typeof value === "string")
          .map(([key, value]) => `${key}: ${(value as string).substring(0, 500)}`)
          .join("\n");
      }).join("\n\n");
    }
    return "About details unavailable.";
  } catch {
    return "About details unavailable.";
  }
}

const MINISTRY_NAMES = [
  "Choir",
  "Edavaka Mission",
  "Senior Citizens",
  "Sevika Sanghom",
  "Sunday School",
  "Young Family Fellowship",
  "Yuvajana Sakhyam",
  "Area Prayer",
];

async function fetchMinistriesDetails(baseUrl: string): Promise<string> {
  try {
    const results = await Promise.all(
      MINISTRY_NAMES.map(async (org) => {
        try {
          const res = await fetch(
            `${baseUrl}/api/ministries?org=${encodeURIComponent(org)}`,
            { cache: "no-store" }
          );
          if (!res.ok) return null;
          const data = await res.json();
          if (!data) return null;
          const parts = [`Ministry: ${org}`];
          if (data.About) parts.push(`About: ${data.About.substring(0, 500)}`);
          if (data.Contact) parts.push(`Contact: ${data.Contact}`);
          return parts.join("\n");
        } catch {
          return null;
        }
      })
    );
    const valid = results.filter(Boolean);
    return valid.length > 0 ? valid.join("\n\n") : "Ministry details unavailable.";
  } catch {
    return "Ministry details unavailable.";
  }
}

async function fetchLeadershipDetails(baseUrl: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}/api/about/leadership`, { cache: "no-store" });
    if (!res.ok) return "Leadership details unavailable.";
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data
        .filter((member: any) => member.MemberName)
        .map((member: any) => {
          // Include all non-empty fields except Image
          const parts = Object.entries(member)
            .filter(([key, value]) => value && key !== "Image" && typeof value === "string")
            .map(([key, value]) => `${key}: ${value}`);
          return `- ${parts.join(", ")}`;
        })
        .join("\n");
    }
    return "Leadership details unavailable.";
  } catch {
    return "Leadership details unavailable.";
  }
}

async function fetchContactDetails(baseUrl: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}/api/contact-details`, { cache: "no-store" });
    if (!res.ok) return "Contact details unavailable.";
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((contact: any) => {
        return Object.entries(contact)
          .filter(([, value]) => value)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join("\n");
      }).join("\n");
    }
    return "Contact details unavailable.";
  } catch {
    return "Contact details unavailable.";
  }
}

async function fetchAchenDetails(baseUrl: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}/api/get-achens`, { cache: "no-store" });
    if (!res.ok) return "Vicar details unavailable.";
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data
        .filter((achen: any) => achen.name)
        .map((achen: any) => {
          const parts = [];
          if (achen.name) parts.push(`Name: ${achen.name}`);
          if (achen.designation) parts.push(`Role: ${achen.designation}`);
          if (achen.phone) parts.push(`Phone: ${achen.phone}`);
          if (achen.email) parts.push(`Email: ${achen.email}`);
          return parts.join(", ");
        })
        .join("\n");
    }
    return "Vicar details unavailable.";
  } catch {
    return "Vicar details unavailable.";
  }
}

async function fetchUpcomingEvents(baseUrl: string): Promise<string> {
  try {
    let allEvents: any[] = [];

    for (const calId of CALENDAR_IDS) {
      try {
        const calendarId = encodeURIComponent(calId + "@group.calendar.google.com");
        const res = await fetch(
          `${baseUrl}/api/calendar-timing?calendar_id=${calendarId}&upcoming=true`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const events = await res.json();
          if (Array.isArray(events)) {
            allEvents = [...allEvents, ...events];
          }
        }
      } catch {
        // Skip failed calendars
      }
    }

    if (allEvents.length === 0) {
      return "No upcoming events data available at the moment.";
    }

    // Sort by date and take next 15 events
    const sorted = allEvents
      .filter((e) => e.start)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 15);

    const eventLines = sorted.map((event) => {
      const startDate = new Date(event.start);
      const dateStr = startDate.toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Australia/Sydney",
      });
      const timeStr = startDate.toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Australia/Sydney",
      });
      return `- ${event.summary}: ${dateStr} at ${timeStr}`;
    });

    return eventLines.join("\n");
  } catch {
    return "Unable to fetch event data at this time.";
  }
}

function buildSystemPrompt(eventsContext: string, contactContext: string, achenContext: string, leadershipContext: string, ministriesContext: string, aboutContext: string, formerVicarsContext: string): string {
  return `You are a friendly and helpful assistant for Bethel Mar Thoma Church Sydney.
You help visitors with information about the church, service times, location, ministries, and events.

Key information:
- Church Address: 1650 The Horsley Dr, Horsley Park NSW 2175, Australia
- Parsonage: 3 Reservoir Rd, Blacktown NSW 2148, Australia
- The church is part of the Mar Thoma Syrian Church tradition
- Donations can be made at: https://sydneymarthomachurch.square.site/
- Website: https://sydneymarthoma.church

ABOUT THE CHURCH:
${aboutContext}

CHURCH CONTACT DETAILS:
${contactContext}

VICAR / CLERGY DETAILS:
${achenContext}

CHURCH LEADERSHIP & COMMITTEE MEMBERS:
${leadershipContext}

FORMER VICARS (with their service periods):
${formerVicarsContext}

MINISTRIES & ORGANISATIONS:
${ministriesContext}

UPCOMING EVENTS (real data from church calendar):
${eventsContext}

IMPORTANT RULES:
- ONLY provide service times and event information from the UPCOMING EVENTS data above.
- Use the CONTACT DETAILS, VICAR/CLERGY DETAILS, LEADERSHIP, ABOUT, and MINISTRIES data above to answer questions about the church.
- If the data doesn't contain what the visitor is asking about, say "I don't have that information right now. Please check our website or contact the church directly."
- NEVER make up or guess service times, dates, contact numbers, or other details.
- When listing multiple events, group them by date. Use the format:
  [Day], [Date] (e.g., "Sunday, July 13th")
  • Event name — Time
  • Event name — Time
  
  Then leave a blank line before the next date group. This makes it easy to scan.
- Be concise, warm, and welcoming.
- Keep responses to 1-3 short sentences unless the visitor asks to list all services.
- When asked about a single service, give just that one service's date and time.`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Chat service is not configured" },
        { status: 503 }
      );
    }

    // Build the base URL from the request for internal API calls
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Fetch real data from church APIs
    const [eventsContext, contactContext, achenContext, leadershipContext, ministriesContext, aboutContext, formerVicarsContext] = await Promise.all([
      fetchUpcomingEvents(baseUrl),
      fetchContactDetails(baseUrl),
      fetchAchenDetails(baseUrl),
      fetchLeadershipDetails(baseUrl),
      fetchMinistriesDetails(baseUrl),
      fetchAboutDetails(baseUrl),
      fetchFormerVicarsDetails(baseUrl),
    ]);
    const systemPrompt = buildSystemPrompt(eventsContext, contactContext, achenContext, leadershipContext, ministriesContext, aboutContext, formerVicarsContext);

    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10),
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure OpenAI error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to get response from AI service" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
