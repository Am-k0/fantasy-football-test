/**
 * Format date to readable string
 * @param {string} isoString - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (isoString, options = {}) => {
  if (!isoString) return "N/A";
  
  try {
    const date = new Date(isoString);
    const defaultOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    };
    return date.toLocaleDateString("en-US", defaultOptions);
  } catch {
    return "Invalid Date";
  }
};

/**
 * Format date with full details
 * @param {string} dateString - Date string
 * @returns {string} Formatted date with full details
 */
export const formatDateFull = (dateString) => {
  if (!dateString) return "TBA";
  
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

/**
 * Format week number
 * @param {number} week - Week number
 * @returns {string} Formatted week string
 */
export const formatWeek = (week) => {
  return week ? `Week ${week}` : "Week N/A";
};

/**
 * Format salary to USD currency
 * @param {number} salary - Salary amount
 * @returns {string} Formatted salary
 */
export const formatSalary = (salary) => {
  if (typeof salary !== "number") return "N/A";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salary);
};

/**
 * Format salary without currency symbol (for display)
 * @param {number} salary - Salary amount
 * @returns {string} Formatted salary number
 */
export const formatSalaryNumber = (salary) => {
  if (!salary) return "0";
  return salary.toLocaleString();
};

/**
 * Format number with locale
 * @param {string|number} value - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (value) => {
  if (typeof value === "string" && !isNaN(Number(value))) {
    return Number(value).toLocaleString();
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return value.toString();
};

/**
 * Format points per dollar to 3 decimal places
 * @param {number} points - Points per dollar value
 * @returns {string} Formatted value
 */
export const formatPointsPerDollar = (points) => {
  if (!points) return "0";
  return points.toFixed(3);
};

/**
 * Format projected ownership to 3 decimal places with percentage
 * @param {number} value - Projected ownership value
 * @returns {string} Formatted percentage value
 */
export const formatProjectedOwnership = (value) => {
  if (!value) return "0";
  return value.toFixed(3);
};

/**
 * Round fantasy points to whole number
 * @param {number} points - Fantasy points
 * @returns {number} Rounded points
 */
export const roundFantasyPoints = (points) => {
  return Math.round(points || 0);
};

/**
 * Extract all games from tournaments data
 * @param {Array} tournaments - Array of tournament objects
 * @returns {Array} Array of games
 */
export const extractGamesFromTournaments = (tournaments) => {
  if (!Array.isArray(tournaments) || tournaments.length === 0) return [];

  const games = [];
  
  tournaments.forEach((slate) => {
    if (slate.dfsSlateGames && Array.isArray(slate.dfsSlateGames)) {
      slate.dfsSlateGames.forEach((slateGame) => {
        const g = slateGame.game;
        if (g) {
          games.push({
            id: slateGame.slateGameId,
            slateGameId: slateGame.slateGameId,
            slateId: slate.slateId,
            globalGameId: g.globalGameId,
            gameKey: g.gameKey,
            awayTeam: g.awayTeam,
            homeTeam: g.homeTeam,
            dateTime: g.dateTime,
            date: g.dateTime,
            stadiumName: g.stadiumDetails?.name || "N/A",
            stadiumDetails: g.stadiumDetails || {},
            weather: g.forecastDescription || "N/A",
            forecastDescription: g.forecastDescription || "N/A",
            status: g.status || "N/A",
            week: g.week,
            channel: g.channel || "N/A",
          });
        }
      });
    }
  });

  return games;
};

/**
 * Extract all players from tournaments data
 * @param {Array} tournaments - Array of tournament objects
 * @returns {Array} Array of players
 */
export const extractPlayersFromTournaments = (tournaments) => {
  if (!Array.isArray(tournaments) || tournaments.length === 0) return [];

  const allPlayers = tournaments.flatMap((slate) =>
    (slate.dfsSlatePlayers || []).map((p) => ({
      id: p.playerId,
      name: p.operatorPlayerName,
      position: p.operatorPosition === "DST" ? "DEF" : p.operatorPosition,
      team: p.team || null,
      avatar: "/images/player.png",
      fantasyPoints: p.fantasyPoints ?? 0,
      salary: p.operatorSalary ?? 0,
      fantasyPointsPerDollar: p.fantasyPointsPerDollar ?? 0,
      projectedOwnership: p.projectedOwnership ?? 0,
      allPositions: p.operatorRosterSlots || [p.operatorPosition],
    }))
  );

  // Remove duplicates by player ID
  const uniquePlayersMap = new Map();
  allPlayers.forEach((player) => {
    if (!uniquePlayersMap.has(player.id)) {
      uniquePlayersMap.set(player.id, player);
    }
  });

  return Array.from(uniquePlayersMap.values());
};

/**
 * Filter players by valid positions for fantasy football
 * @param {Array} players - Array of players
 * @returns {Array} Filtered array of players
 */
export const filterValidPositions = (players) => {
  const validPositions = ["QB", "RB", "WR", "TE", "DEF", "K"];
  return players.filter(
    (player) => player.position && validPositions.includes(player.position)
  );
};

/**
 * Get unique games by globalGameId
 * @param {Array} games - Array of games
 * @returns {Array} Array of unique games
 */
export const getUniqueGames = (games) => {
  return games.filter(
    (g, index, self) =>
      index === self.findIndex((x) => x.globalGameId === g.globalGameId)
  );
};

/**
 * Sort games by date
 * @param {Array} games - Array of games
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array of games
 */
export const sortGamesByDate = (games, order = "asc") => {
  return [...games].sort((a, b) => {
    const dateA = new Date(a.dateTime || a.date);
    const dateB = new Date(b.dateTime || b.date);
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Group matches by tournament (slateId)
 * @param {Array} matches - Array of matches
 * @returns {Object} Grouped matches by slateId
 */
export const groupMatchesByTournament = (matches) => {
  if (!matches || matches.length === 0) return {};

  const groups = {};
  
  matches.forEach((match) => {
    const slateId = match.slateId || "Unknown";
    if (!groups[slateId]) {
      groups[slateId] = [];
    }
    groups[slateId].push(match);
  });

  return Object.keys(groups)
    .sort((a, b) => a.localeCompare(b))
    .reduce((result, key) => {
      result[key] = groups[key];
      return result;
    }, {});
};

/**
 * Get unique values from array
 * @param {Array} array - Input array
 * @returns {Array} Array of unique values
 */
export const getUniqueValues = (array) => {
  return Array.from(new Set(array)).sort();
};

/**
 * Extract unique tournament IDs from matches
 * @param {Array} matches - Array of matches
 * @returns {Array} Sorted array of unique slateIds
 */
export const extractTournamentIds = (matches) => {
  if (!matches || matches.length === 0) return [];

  const slateIds = new Set();
  matches.forEach((game) => {
    if (game.slateId && game.slateId !== "Unknown") {
      slateIds.add(game.slateId);
    }
  });

  return Array.from(slateIds).sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true })
  );
};

/**
 * Extract unique teams from matches or players
 * @param {Array} items - Array of matches or players
 * @returns {Array} Sorted array of unique team names
 */
export const extractTeams = (items) => {
  if (!items || items.length === 0) return [];
  
  const teams = new Set();
  items.forEach((item) => {
    if (item.homeTeam) teams.add(item.homeTeam);
    if (item.awayTeam) teams.add(item.awayTeam);
    if (item.team) teams.add(item.team);
  });
  
  return Array.from(teams).filter((t) => t !== null).sort();
};

/**
 * Extract unique channels from matches
 * @param {Array} matches - Array of matches
 * @returns {Array} Sorted array of unique channels
 */
export const extractChannels = (matches) => {
  if (!matches || matches.length === 0) return [];
  
  const channels = new Set();
  matches.forEach((game) => {
    if (game.channel && game.channel !== "N/A") {
      channels.add(game.channel);
    }
  });
  
  return Array.from(channels).sort();
};

/**
 * Extract unique stadium types from matches
 * @param {Array} matches - Array of matches
 * @returns {Array} Sorted array of unique stadium types
 */
export const extractStadiumTypes = (matches) => {
  if (!matches || matches.length === 0) return [];
  
  const types = new Set();
  matches.forEach((game) => {
    if (game.stadiumDetails?.type) {
      types.add(game.stadiumDetails.type);
    }
  });
  
  return Array.from(types).sort();
};

/**
 * Extract unique positions from players
 * @param {Array} players - Array of players
 * @returns {Array} Sorted array of unique positions
 */
export const extractPositions = (players) => {
  if (!players || players.length === 0) return [];
  
  const positions = new Set();
  players.forEach((player) => {
    if (player.position) {
      positions.add(player.position);
    }
  });
  
  return Array.from(positions).sort();
};

/**
 * Calculate average salary from tournaments
 * @param {Array} tournaments - Array of tournament objects
 * @returns {number} Average salary
 */
export const calculateAverageSalary = (tournaments) => {
  let totalSalary = 0;
  let playerCount = 0;

  tournaments.forEach((slate) => {
    slate.dfsSlatePlayers?.forEach((player) => {
      if (player.operatorSalary && player.operatorSalary > 0) {
        totalSalary += player.operatorSalary;
        playerCount++;
      }
    });
  });

  return playerCount > 0 ? totalSalary / playerCount : 0;
};

/**
 * Calculate total games from tournaments
 * @param {Array} tournaments - Array of tournament objects
 * @returns {number} Total number of games
 */
export const calculateTotalGames = (tournaments) => {
  return tournaments.reduce(
    (sum, slate) => sum + (slate.dfsSlateGames?.length || 0),
    0
  );
};

/**
 * Calculate total fantasy points from roster slots
 * @param {Array} rosterSlots - Array of roster slot objects
 * @returns {number} Total fantasy points
 */
export const calculateTotalFantasyPoints = (rosterSlots) => {
  return rosterSlots.reduce(
    (sum, slot) => sum + (slot.player?.fantasyPoints ?? 0),
    0
  );
};

/**
 * Calculate current budget spent from roster slots
 * @param {Array} rosterSlots - Array of roster slot objects
 * @returns {number} Total budget spent
 */
export const calculateCurrentBudget = (rosterSlots) => {
  return rosterSlots.reduce(
    (sum, slot) => sum + (slot.player?.salary ?? 0),
    0
  );
};

/**
 * Calculate remaining budget
 * @param {number} totalBudget - Total available budget
 * @param {number} currentBudget - Current budget spent
 * @returns {number} Remaining budget
 */
export const calculateRemainingBudget = (totalBudget, currentBudget) => {
  return totalBudget - currentBudget;
};

/**
 * Check if team is complete (all slots filled and within budget)
 * @param {Array} rosterSlots - Array of roster slot objects
 * @param {number} remainingBudget - Remaining budget
 * @returns {boolean} Whether team is complete
 */
export const isTeamComplete = (rosterSlots, remainingBudget) => {
  const allSlotsFilled = rosterSlots.every((slot) => slot.player !== null);
  const withinBudget = remainingBudget >= 0;
  return allSlotsFilled && withinBudget;
};

/**
 * Count players from specific team in roster
 * @param {Array} rosterSlots - Array of roster slot objects
 * @param {string} teamName - Team name to count
 * @param {number} excludeSlotId - Slot ID to exclude from count
 * @returns {number} Count of players from team
 */
export const countPlayersFromTeam = (rosterSlots, teamName, excludeSlotId = null) => {
  if (!teamName) return 0;
  
  return rosterSlots.filter(
    (slot) =>
      slot.player &&
      slot.player.team === teamName &&
      (excludeSlotId === null || slot.id !== excludeSlotId)
  ).length;
};

/**
 * Check if player can be afforded with remaining budget
 * @param {Object} player - Player object
 * @param {number} remainingBudget - Remaining budget
 * @param {number} currentSlotSalary - Current slot's player salary (if any)
 * @returns {boolean} Whether player can be afforded
 */
export const canAffordPlayer = (player, remainingBudget, currentSlotSalary = 0) => {
  const playerSalary = player.salary || 0;
  return remainingBudget + currentSlotSalary >= playerSalary;
};

/**
 * Check if player can be selected (team limit + budget)
 * @param {Object} player - Player object
 * @param {Array} rosterSlots - Array of roster slot objects
 * @param {number} remainingBudget - Remaining budget
 * @param {number} activeSlotId - Active slot ID
 * @param {number} teamLimit - Maximum players from same team
 * @returns {boolean} Whether player can be selected
 */
export const canSelectPlayer = (
  player,
  rosterSlots,
  remainingBudget,
  activeSlotId,
  teamLimit = 2
) => {
  if (!player.team) {
    return canAffordPlayer(
      player,
      remainingBudget,
      rosterSlots.find((s) => s.id === activeSlotId)?.player?.salary ?? 0
    );
  }

  const currentSlotSalary = rosterSlots.find((s) => s.id === activeSlotId)?.player?.salary ?? 0;
  const withinTeamLimit = countPlayersFromTeam(rosterSlots, player.team, activeSlotId) < teamLimit;
  const withinBudget = canAffordPlayer(player, remainingBudget, currentSlotSalary);

  return withinTeamLimit && withinBudget;
};

/**
 * Get button text for player selection
 * @param {Object} player - Player object
 * @param {Array} rosterSlots - Array of roster slot objects
 * @param {number} remainingBudget - Remaining budget
 * @param {number} activeSlotId - Active slot ID
 * @returns {string} Button text
 */
export const getSelectButtonText = (player, rosterSlots, remainingBudget, activeSlotId) => {
  const currentSlotSalary = rosterSlots.find((s) => s.id === activeSlotId)?.player?.salary ?? 0;
  
  if (!canAffordPlayer(player, remainingBudget, currentSlotSalary)) {
    return "Over Budget";
  }
  
  if (!canSelectPlayer(player, rosterSlots, remainingBudget, activeSlotId)) {
    return "Team Limit";
  }
  
  return "Select";
};

/**
 * Filter players by position (including FLEX)
 * @param {Array} players - Array of players
 * @param {string} slotType - Slot type/position
 * @param {Array} assignedPlayerIds - Array of already assigned player IDs
 * @returns {Array} Filtered players
 */
export const filterPlayersByPosition = (players, slotType, assignedPlayerIds = []) => {
  return players.filter((p) => {
    let matchesPosition = false;
    
    if (slotType === "FLEX") {
      matchesPosition = ["RB", "WR", "TE"].includes(p.position);
    } else {
      matchesPosition = p.position === slotType;
    }

    const notAssigned = !assignedPlayerIds.includes(p.id);
    return matchesPosition && notAssigned;
  });
};

/**
 * Get stadium image based on type
 * @param {string} stadiumType - Stadium type
 * @returns {string} Image path
 */
export const getStadiumImage = (stadiumType) => {
  const type = stadiumType?.toLowerCase();
  
  switch (type) {
    case "dome":
      return "/images/stadionDome.jpg";
    case "outdoor":
      return "/images/stadionOutdoor.jpg";
    case "retractabledome":
      return "/images/stadion3.jpg";
    default:
      return "/images/stadionOutdoor.jpg";
  }
};

/**
 * Find match by ID from tournaments data
 * @param {Array} tournaments - Array of tournament objects
 * @param {string|number} matchId - Match ID to find
 * @returns {Object|null} Match data or null
 */
export const findMatchById = (tournaments, matchId) => {
  if (!tournaments) return null;

  let foundMatch = null;

  tournaments.forEach((slate) => {
    slate.dfsSlateGames?.forEach((slateGame) => {
      if (String(slateGame.slateGameId) === String(matchId)) {
        const g = slateGame.game;
        foundMatch = {
          id: slateGame.slateGameId,
          gameKey: g.gameKey,
          awayTeam: g.awayTeam,
          homeTeam: g.homeTeam,
          dateTime: g.dateTime,
          stadiumName: g.stadiumDetails?.name || "N/A",
          stadium: {
            name: g.stadiumDetails?.name || "N/A",
            city: g.stadiumDetails?.city || "N/A",
            capacity: g.stadiumDetails?.capacity || "N/A",
            type: g.stadiumDetails?.type || "N/A",
            geoLat: g.stadiumDetails?.geoLat || "N/A",
            geoLong: g.stadiumDetails?.geoLong || "N/A",
            playingSurface: g.stadiumDetails?.playingSurface || "Artificial",
          },
          weather: {
            description: g.forecastDescription || "Clear Sky",
            temperature: g.forecastTempLow || 87,
            windSpeed: g.forecastWindSpeed || 5,
          },
          tvChannel: g.channel || null,
          odds: {
            homeWin: g.homeTeamMoneyLine || "-179",
            awayWin: g.awayTeamMoneyLine || "147",
            pointSpread: g.pointSpread || "-3.5",
            overUnder: g.overUnder || "48.5",
          },
          week: g.week,
          season: g.season || "N/A",
          status: g.status || "Scheduled",
        };
      }
    });
  });

  return foundMatch;
};

/**
 * Find player by ID from tournaments data
 * @param {Array} tournaments - Array of tournament objects
 * @param {string|number} playerId - Player ID to find
 * @returns {Object|null} Player data or null
 */
export const findPlayerById = (tournaments, playerId) => {
  if (!tournaments) return null;

  for (const slate of tournaments) {
    if (slate.dfsSlatePlayers) {
      const playerData = slate.dfsSlatePlayers.find(
        (p) => p.playerId === Number(playerId)
      );
      
      if (playerData) {
        return {
          id: playerData.playerId,
          name: playerData.operatorPlayerName,
          position: playerData.operatorPosition,
          team: playerData.team || null,
          avatar: "/images/player.png",
          points: playerData.fantasyPoints || 0,
          salary: playerData.operatorSalary || 0,
          fantasyPointsPerDollar: playerData.fantasyPointsPerDollar || 0,
          projectedOwnership: playerData.projectedOwnership || 0,
          allPositions: playerData.operatorRosterSlots || [playerData.operatorPosition],
        };
      }
    }
  }

  return null;
};
