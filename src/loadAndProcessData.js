const ROLLING_AVERAGE = 20;

export const loadAndProcessData = () => Promise.all([
        d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv"),
        d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv"),
        d3.json("https://raw.githubusercontent.com/mattrrubino/covid-visualization/main/us_geo.json")
    ]).then(([usDataLoaded, usStatesDataLoaded, usGeoLoaded]) => {
    
        // Parse US data
        usDataLoaded.forEach(d => {
            d.date = new Date(d.date);
            d.cases = +d.cases;
            d.deaths = +d.deaths;
        });
    
        // Parse US state data
        usStatesDataLoaded.forEach(d => {
            d.date = new Date(d.date);
            d.fips = +d.fips;
            d.cases = +d.cases;
            d.deaths = +d.deaths;
        });
    
        // Parse US geoJSON
        usGeoLoaded.features.forEach(feature => {
            feature.properties.STATE = +feature.properties.STATE;
        });
    
        // Group state data by FIPS code and convert to new cases/deaths each day, not total (effectively the slope)
        const usStatesGrouped = d3.group(usStatesDataLoaded, d => d.fips);
        usStatesGrouped.forEach((v, k) => {
            let cases = 0;
            let deaths = 0;
    
            v.forEach(d => {
                d.cases = d.cases - cases;
                d.deaths = d.deaths - deaths;
    
                cases += d.cases;
                deaths += d.deaths;
            });
    
            // Clean data
            usStatesGrouped.set(k, v.filter(d => d.cases !== 0 || d.deaths !== 0));
        });
    
        // Create rolling average map
        const usStatesAverage = new Map();
        usStatesGrouped.forEach((v, k) => {
            const averages = [];
    
            v.forEach((d, i) => {
                const averageArr = v.slice(Math.max(i+1 - ROLLING_AVERAGE, 0), i+1);
                const averageCases = averageArr.reduce((acc, d) => acc + d.cases, 0) / averageArr.length;
                const averageDeaths = averageArr.reduce((acc, d) => acc + d.deaths, 0) / averageArr.length;
    
                averages.push({date: d.date, state: d.state, fips: d.fips, cases: averageCases, deaths: averageDeaths});
            });
    
            usStatesAverage.set(k, averages);
        });

        return {usData: usDataLoaded, usStatesData: usStatesAverage, usGeo: usGeoLoaded};
    });
