export interface League {
  name: string;
  sport: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  url: string;
  country?: string;
}

export const getCurrentLeagues = (): Omit<League, 'status'>[] => [
  {
    name: "UEFA Euro 2025 Qualifiers",
    sport: "Football",
    startDate: "2025-03-01",
    endDate: "2025-11-30",
    url: "https://www.uefa.com/european-qualifiers",
    country: "Europe"
  },
  {
    name: "FIFA World Cup 2026 Qualifiers",
    sport: "Football", 
    startDate: "2025-09-01",
    endDate: "2026-03-31",
    url: "https://www.fifa.com/worldcup/preliminaries",
    country: "Global"
  },
  {
    name: "ICC Champions Trophy 2025",
    sport: "Cricket",
    startDate: "2025-02-19",
    endDate: "2025-03-09",
    url: "https://www.icc-cricket.com/tournaments/champions-trophy",
    country: "Pakistan"
  },
  {
    name: "Copa America 2025",
    sport: "Football",
    startDate: "2025-06-20",
    endDate: "2025-07-14",
    url: "https://www.conmebol.com/copa-america",
    country: "South America"
  },
  {
    name: "The Ashes 2025",
    sport: "Cricket",
    startDate: "2025-06-15",
    endDate: "2025-08-15",
    url: "https://www.espncricinfo.com/series/the-ashes-2025",
    country: "England"
  },
  {
    name: "Wimbledon 2025",
    sport: "Tennis",
    startDate: "2025-06-30",
    endDate: "2025-07-13",
    url: "https://www.wimbledon.com",
    country: "England"
  },
  {
    name: "UEFA Nations League Finals 2025",
    sport: "Football",
    startDate: "2025-06-04",
    endDate: "2025-06-08",
    url: "https://www.uefa.com/uefanationsleague",
    country: "Europe"
  },
  {
    name: "World Athletics Championships 2025",
    sport: "Athletics",
    startDate: "2025-07-15",
    endDate: "2025-07-24",
    url: "https://www.worldathletics.org/competitions/world-athletics-championships",
    country: "Japan"
  }
];
