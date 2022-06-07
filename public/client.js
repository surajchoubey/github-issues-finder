const FORM = document.querySelector("form");
const OWNER = document.querySelector("#owner");
const REPO = document.querySelector("#repo");
const LOADING = document.querySelector("#loading");
const clear = document.querySelector("#clear");
const showissues = document.querySelector("#showissues");
const weekdetails = document.querySelector("#weekdetails");
const issuedetails = document.querySelector("#issuedetails");

let totalOpen = document.querySelector("#totalOpen");
let totalClosed = document.querySelector("#totalClosed");
let weeklyRatio = document.querySelector("#weeklyRatio");

const Clear = () => {
  OWNER.value = "";
  REPO.value = "";
  totalOpen.textContent = "";
  totalClosed.textContent = "";
  weeklyRatio.textContent = "";
  weekdetails.innerHTML = "";
  issuedetails.innerHTML = "";
};

const getData = async (owner, repo) => {
  await fetch("/search?owner=" + owner + "&repo=" + repo).then((res) => {
    totalOpen.textContent = "";
    totalClosed.textContent = "";
    weeklyRatio.textContent = "";
    weekdetails.innerHTML = "";
    issuedetails.innerHTML = "";

    res.json().then((data) => {
      if (data.error) {
        LOADING.textContent = data.error;
        return;
      }

      LOADING.textContent = "";
      totalOpen.textContent = "Total Count of Open Issues = " + data.total_open;
      totalClosed.textContent =
        "Total Count of Closed Issues = " + data.total_closed;
      weeklyRatio.textContent = "Weekly Closure Ratio = " + data.avgWeeklyRate;

      const keys = Object.keys(data.WeekArray);

      for (key in keys) {
        let week = document.createElement("tr");
        week.innerHTML = ` 
                    <td> ${Number(key) + 1} </td>
                    <td> ${data.WeekArray[key].closureRate} </td>
                `;
        weekdetails.appendChild(week);
      }

      for (let i = 0; i < data.issueList.length; i++) {
        let issue = document.createElement("tr");
        issue.innerHTML = `
                    <td> ${data.issueList[i].date} </td>
                    <td> ${data.issueList[i].time} </td>
                    <td> ${data.issueList[i].issue} </td>
                `;
        issuedetails.appendChild(issue);
      }
    });
  });
};
FORM.addEventListener("submit", async (e) => {
  e.preventDefault();
  LOADING.textContent = "LOADING...";
  await getData(OWNER.value, REPO.value);
});

clear.addEventListener("click", (e) => {
  e.preventDefault();
  Clear();
});

showissues.addEventListener("click", (e) => {
  e.preventDefault();
});
