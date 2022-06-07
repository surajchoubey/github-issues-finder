const { Octokit } = require('@octokit/rest')
const dotenv = require('dotenv')

dotenv.config()

const octokit = new Octokit({
    auth: process.env.PERSONAL_ACCESS_TOKEN
});

class WeekDetail {
    constructor(weekNumber, openCount = 0, closedCount = 0) {
        this.weekNumber = weekNumber
        this.closureRate = 0
        this.openCount = openCount
        this.closedCount = closedCount
    }
}

const WEEK_FUNCTION = async (owner, repo) => {

    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues', {
            owner,
            repo,
            state: 'all',
            per_page: 100,
            sort: 'created',
            direction: 'desc'
        })

        let total_open = 0, total_closed = 0

        let now = new Date()
        let iterator = new Date(now.setDate(now.getDate() - 7))
        let i = 0

        let WeekArray = {}
        let issueList = []
        WeekArray[i] = new WeekDetail(i)

        await data.forEach(item => {

            const date = new Date(item.created_at)

            let issue = { 
                date: `${date.toDateString()}`, 
                time: `${date.toLocaleString('en-US', { hour: 'numeric', hour12: true })}`,
                issue: `${item.title}` 
            }
            issueList.push(issue)

            if (date.getTime() > iterator.getTime()) {

                // console.log(`Week ${i} ${date.toDateString()} ${iterator.toDateString()} ${item.state} ${item.title}`)

                switch(item.state) {
                    case 'closed': ++WeekArray[i].closedCount
                        break
                    case 'open': ++WeekArray[i].openCount
                        break
                }

            } else if (i < 9) {
                i++
                iterator.setDate(iterator.getDate() - 7)
                WeekArray[i] = new WeekDetail(i)
            }

            switch(item.state) {
                case 'closed': ++total_closed 
                    break
                case 'open': ++total_open
                    break
            }

        })

        const keys = Object.keys(WeekArray)

        let avgWeeklyRate = 0, rate = 0

        if (keys.length > 0) {

            let N = keys.length

            for (let i = N - 1; i >= 0; i--) {

                if (WeekArray[i].openCount === 0) {
                    continue
                }

                if (i === N - 1) {
                    rate = WeekArray[keys[i]].closedCount / WeekArray[keys[i]].openCount
                } else {
                    rate = WeekArray[keys[i]].closedCount / (WeekArray[keys[i]].openCount + WeekArray[keys[i + 1]].openCount)
                }

                // console.log(`For nth last week ${i} rate = ${rate}`)
                WeekArray[keys[i]].closureRate = rate
                // console.log(avgWeeklyRate)
                avgWeeklyRate += rate
            }

            avgWeeklyRate /= keys.length
        }

        return {
            total_open,
            total_closed,
            avgWeeklyRate,
            WeekArray,
            issueList
        }

    } catch (err) {
        return {
            error: err.message
        }
    }

}

module.exports = WEEK_FUNCTION
