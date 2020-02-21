import moment from "moment";

/**
 * Get GET parameter
 * 
 * @param {String} variable parameter name
 * @return {String} value
 */
function getQueryVariable(variable) {
    var query = window.location.search.split("?")[1];
    if (!query)
        return false
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
}

/**
 * Format Bracket. Should work for any double elimination bracket that is formatted like the 32 Team one
 * 
 * @param {Object} raw The google sheet data
 */
function parseBracket(raw) {
    function getMatch(row) {
        var prevMatchNumbers = []
        var teamScrapyardIds = []
        // Get prev match number by recursing through the bracket that exists so far
        for (let id of [row[1].split("-")[1], row[2].split("-")[1]]) {
            prevMatchNumbers.push()
            let res = [...bracket.winners, ...bracket.losers].map((round) => {
                var res = round.matches.filter((match) => match.id == id)
                return res.length == 0?undefined: res
            })
            res = res.filter((r) => r!==undefined)
            prevMatchNumbers.push(res.length != 0?res[0][0].number:null)
        }
        for (let name of [row[3], row[4]]) {
            for (let tr of raw.teams) {
                if (tr[0] == name) {
                    teamScrapyardIds.push(tr[1])
                    break;
                }
            }
        }
        var timeString = moment(row[6],"hh:mm:ss a").format("hh:mm a")
        if (timeString == "Invalid date") {
            timeString = "TBA"
        }
        var dateString = row[7]
        return {
            id: row[0],
            prevMatches: [row[1], row[2]],
            prevMatchNumbers,
            teams: [row[3], row[4]],
            teamScrapyardIds,
            winner: row[5]?row[5]:null,
            time: row[6],
            timeString,
            date: row[7],
            dateString,
            minutesUntil: row[8],
            number: row[9]
        }
    }

    var bracket = {
        winners: [],
        losers: []
    }

    // Format First Round
    if (raw.first) {
        bracket.winners.push({matches: []})
        for (let row of raw.first) {
            if (row[0].startsWith("PA")) {
                bracket.winners[0].matches.push(getMatch(row))
            }
        }
    }

    // Format Winners
    var round = bracket.winners.length - 1;
    var currId = "";
    for (let row of raw.winners) {
        if (row[0].startsWith("W") && row[1] && row[1] != "") {
            if (row[0].substr(0,2) != currId) {
                currId = row[0].substr(0,2)
                round += 1;
                bracket.winners.push({matches: []})
            }
            bracket.winners[round].matches.push(getMatch(row))
        }
    }

    // Format Losers
    var round = -1;
    var currId = "";
    for (let row of raw.losers) {
        if (row[0].startsWith("L") && row[1] && row[1] != "") {
            if (row[0].substr(0,2) != currId) {
                currId = row[0].substr(0,2)
                round += 1;
                bracket.losers.push({matches: []})
            }
            bracket.losers[round].matches.push(getMatch(row))
        }
    }

    function calcSpacing(rounds) {
        for (let i of Object.keys(rounds)) {
            if (!rounds[i - 1]) {
                rounds[i].spacing = 0
                rounds[i].offset = 0
                rounds[i].connector = null
            } else if (rounds[i - 1].matches.length == rounds[i].matches.length) {
                rounds[i].spacing = rounds[i - 1].spacing
                rounds[i].offset = rounds[i - 1].offset
                rounds[i].connector = "winner-loser"
                rounds[i].connectorHeight = rounds[i - 1].connectorHeight
            } else {
                rounds[i].spacing = 2 * (rounds[i - 1].spacing + 1) - 1
                rounds[i].offset = - rounds[i].spacing/2
                rounds[i].connector = "winner-winner"
                rounds[i].connectorHeight = rounds[i - 1].spacing + 1
            }
        }
    }

    // Calculate SVG connector spacings
    calcSpacing(bracket.winners)
    calcSpacing(bracket.losers)

    // Add prev round id for final match prev loser
    bracket.winners[bracket.winners.length - 2].matches[0].prevMatchNumbers[1] = bracket.losers[bracket.losers.length - 1].matches[0].number

    // Fix connector for optional final game
    bracket.winners[bracket.winners.length - 1].connector = "both"

    return bracket
}

export default {
    getQueryVariable,
    parseBracket
}