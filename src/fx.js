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
 * Everything else in this react site is pretty dumb and just for displaying stuff neatly. 
 * This function basically does all the conversion and calculations
 * 
 * @param {Object} raw The google sheet data
 */
function parseBracket(raw) {
    function getMatch(row) {
        var prevMatchNumbers = []
        var teamScrapyardIds = []
        var prevMatches = [row[1], row[2]]
        // Get prev match number by recursing through the bracket that exists so far
        let i = 0
        for (let id of [row[1].split("-")[1], row[2].split("-")[1]]) {
            prevMatchNumbers.push()
            let res = [...bracket.winners, ...bracket.losers].map((round) => {
                var res = round.matches.filter((match) => match.id == id)
                return res.length == 0?undefined: res
            })
            res = res.filter((r) => r!==undefined)
            if (res.length > 0 && res[0][0].hidden) {
                let prevMatchIdx = res[0][0].prevMatchNumbers[0] === null || res[0][0].prevMatchNumbers[0] === undefined ? 1 : 0
                prevMatchNumbers.push(res[0][0].prevMatchNumbers[prevMatchIdx])
                prevMatches[i] = res[0][0].prevMatches[prevMatchIdx]
            } else 
                prevMatchNumbers.push(res.length != 0?res[0][0].number:null)
            i += 1
        }
        for (let name of [row[3], row[4]]) {
            for (let tr of raw.teams) {
                if (tr[0] == name) {
                    teamScrapyardIds.push(tr[1])
                    break;
                }
            }
        }
        var currentMatch = false
        // recalculate minutes from now because sheets doesn't work if user doesn't put in date
        var minutesFromNow = moment(row[6] + ", " + row[7],"hh:mm:ss a, M/D/YYYY").diff(moment(), 'minutes')
        if (minutesFromNow <= 0 && !row[5]) {
            currentMatch = true
            // Check if previous match has a winner. If not, that one is the current one
            for (let round of [...bracket.winners, ...bracket.losers]) {
                for (let match of round.matches) {
                    if (match.number == row[9] - 1) {
                        if (!match.winner) {
                            currentMatch = false
                        }
                        break
                    }
                }
                if (!currentMatch) 
                    break
            }
        }
        var timeString = moment(row[6],"hh:mm:ss a").format("h:mm a")
        if (currentMatch) {
            //timeString = "NOW"
        }
        if (timeString == "Invalid date") {
            timeString = null
        }
        var dateString = moment(row[7],"M/D/YYYY").calendar(null, {
            sameDay: '[]',
            nextDay: '[Tomorrow]',
            nextWeek: 'dddd',
            lastDay: '[Yesterday]',
            lastWeek: '[Last] dddd',
            sameElse: 'DD/MM/YYYY'
        });
        if (dateString == "Invalid date") {
            dateString = ""
        }
        var hidden = row[3] == "-" || row[4] == "-"

        return {
            id: row[0],
            prevMatches,
            prevMatchNumbers,
            teams: [row[3], row[4]],
            teamScrapyardIds,
            winner: row[5]?row[5]:null,
            time: row[6],
            timeString,
            date: row[7],
            dateString,
            minutesUntil: row[8],
            number: row[9],
            currentMatch,
            hidden
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

    function calcSpacing(rounds, winners = false) {
        if (winners) {
            var sparseFirst = true
            for (let i of Object.keys(rounds[0].matches)) {
                if (i % 2 == 1 && !rounds[0].matches[i].hidden) sparseFirst = false
            }
            for (let i of Object.keys(rounds[1].matches)) {
                if (sparseFirst)
                    rounds[1].matches[i].connector = rounds[0].matches[i * 2].hidden ? null : "winner-loser"
                else
                    rounds[1].matches[i].connector = rounds[0].matches[i * 2].hidden ? (rounds[0].matches[i * 2 + 1].hidden ? null : "winner-bottom") : (rounds[0].matches[i * 2 + 1].hidden ? "winner-top" : "winner-winner")
            }
            if (sparseFirst) 
                rounds[0].matches = rounds[0].matches.filter((v, i) => i % 2 == 0)
        } else {
            for (let i of Object.keys(rounds[1].matches)) {
                rounds[1].matches[i].connector = rounds[0].matches[i].hidden ? null : "winner-loser"
            }
            for (let i of Object.keys(rounds[2].matches)) {
                rounds[2].matches[i].connector = rounds[1].matches[i * 2].hidden ? (rounds[1].matches[i * 2 + 1].hidden ? null : "winner-bottom") : (rounds[0].matches[i * 2 + 1].hidden ? "winner-top" : "winner-winner")
            }
        }
        
        for (let i of Object.keys(rounds)) {
            if (!rounds[i - 1]) {
                rounds[i].spacing = 0
                rounds[i].offset = 0
                rounds[i].connector = null
            } else if (rounds[i - 1].matches.length == rounds[i].matches.length || (sparseFirst && i == 1)) {
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

        if (rounds[0].matches.filter(v => !v.hidden).length == 0) rounds.splice(0, 1)
    }

    // Calculate SVG connector spacings
    calcSpacing(bracket.winners, true)
    calcSpacing(bracket.losers)

    // Add prev round id for final match prev loser
    bracket.winners[bracket.winners.length - 2].matches[0].prevMatchNumbers[1] = bracket.losers[bracket.losers.length - 1].matches[0].number

    // Fix connector for optional final game
    bracket.winners[bracket.winners.length - 1].connector = "both"

    //console.log(JSON.stringify(bracket))

    return bracket
}

export default {
    getQueryVariable,
    parseBracket
}