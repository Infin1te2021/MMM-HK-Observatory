Module.register("MMM-HK-Observatory", {

    weatherProvider: "HKO",
    // Set the default config properties that is specific to this provider
    defaults: {
        header: "MMM-HK-Observatory",
        reloadInterval: 1 * 60 * 1000, //every 1 minute
        updateInterval: 300000, // every 10 minute
        showFooter: true,
        maxForecast: 4,
    },

    start: function() {
        Log.info("Start module: " + this.name);
        this.loaded = false;
        this.fetchedData = null;
        this.sendSocketNotification("SET_CONFIG", this.config);
    },

    getStyles: function() {
        return["MMM-HK-Observatory.css", "font-awesome.css"];
    },

    getHeader: function() {
        if (!this.loaded || this.error) {
            return this.config.header;
        } else {
            return this.config.header + " " + this.fetchedData.updateTime;
        }
    },

    getDom: function () {
        const self = this;
        const wrapper = document.createElement("div");
        wrapper.className = "MMM-HKO";
        wrapper.id = "wrapper";

        if (!this.loaded) {
            wrapper.innerHTML ="LOADING";
            wrapper.className = "light small dimmed";
            return wrapper;
        }

        if (this.error) {
            wrapper.innerHTML = "ERROR";
            wrapper.className = "light small dimmed";
            return wrapper;
        }

        const table = document.createElement("div");
        table.className = "weatherForecastTable";
        table.appendChild(self.createIntro());

        // Create inner-table
        const innertable = document.createElement("table");
        innertable.className = "innerTable";

        // Create table row and insert it into inner-table
        innertable.appendChild(self.createHeader());

		const maxforecastnum = this.config.maxForecast

		// Append row element --> Forecast, Temp&Hum, Description
		for (var i = 0; i < this.fetchedData.weatherForecast.length; i++){
			rowElement = self.createDataRow(this.fetchedData.weatherForecast[i])
			if (i < this.fetchedData.weatherForecast.slice(0, maxforecastnum).length){
				rowElement.style.display = '';
				innertable.appendChild(rowElement)
			}
			else{
				innertable.appendChild(rowElement)
			}
		}

        table.appendChild(innertable)

        // Create footer
        table.appendChild(self.createFooter());

        wrapper.appendChild(table);

        table.addEventListener("click", function() {
			const innertabletrElement = this.getElementsByTagName("tr");
			for (var i = maxforecastnum + 1; i < innertabletrElement.length; i++) {
				innertabletrElement[i].style.display = innertabletrElement[i].style.display ? "" : "none";
			}
		})

        // Return the wrapper to the dom.
        return wrapper;
    },

    // Forecast general situation
    createIntro: function() {
        const introRow = document.createElement("div");
        introRow.className = "introSituation";
        introRow.innerHTML = "9-day Weather Forecast:" + "<br />" + this.fetchedData.generalSituation;
        return introRow;
    },

    createHeader: function() {
        const tableHeader = document.createElement("tr");
        tableHeader.className = "headerTableHeaderRow";

        // Forecast date
        const forecastDateHeader = document.createElement("th");
        forecastDateHeader.className = "forecastDateHeader";
        forecastDateHeader.innerHTML = "Forecast Date";

        // Forecast Icon
        const forecastIconHeader = document.createElement("th");
        forecastIconHeader.className = "forecastIconHeader";
        forecastIconHeader.innerHTML = "";

        // Forecast Temperature & Humidity
        const forecastTempHumiHeader = document.createElement("th");
        forecastTempHumiHeader.className = "forecastTempHumiHeader";
        forecastTempHumiHeader.innerHTML = "Temperature & Humidity";

        // Forecast Weather General Description
        const forecastWeatherDescriptionHeader = document.createElement("th");
        forecastWeatherDescriptionHeader.className = "ForecastWeatherHeader";
        forecastWeatherDescriptionHeader.innerHTML = "Forecast Description";

        tableHeader.appendChild(forecastDateHeader);
        tableHeader.appendChild(forecastIconHeader);
        tableHeader.appendChild(forecastTempHumiHeader);
        tableHeader.appendChild(forecastWeatherDescriptionHeader);

        return tableHeader;
    },

    createDataRow: function(data){

        const tableDataRow = document.createElement("tr");
        tableDataRow.className = "tableDataRow";

        const date = document.createElement("td");
        date.className = "dateData";
        date.innerHTML = moment(data.forecastDate).format("ll");

        const icon = document.createElement("td");
        icon.className = "iconData";
        let srclist = `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${data.ForecastIcon}.png`
        icon.innerHTML = `<img src=\ ${srclist} width=\"49px\" height=\"49px\">`;

        const temphumi = document.createElement("td");
        temphumi.className = "temphumiData";
        temphumi.innerHTML = data.forecastMintemp.value + "-" + data.forecastMaxtemp.value + "°C" + "<br />" +
                                                    data.forecastMinrh.value + "-" + data.forecastMaxrh.value + "%";

        const weather = document.createElement("td");
		weather.className = "weatherData";
		weather.style.cssText = "text-align: left";
        weather.innerHTML = data.forecastWind + "<br />" + data.forecastWeather;


        tableDataRow.appendChild(date);
        tableDataRow.appendChild(icon);
        tableDataRow.appendChild(temphumi);
        tableDataRow.appendChild(weather);
		tableDataRow.style.display = "none";
        return tableDataRow
    },

    createFooter: function() {
        const footerRow = document.createElement("tr");
        footerRow.className = "footerRow";

        const footer = document.createElement("td");
        footer.className = "footer";
        footer.setAttribute("colspan", "5");
        footer.innerHTML = "UPDATED" + ": " + moment().format("dd, DD.MM.YYYY, HH:mm[h]");
        footerRow.appendChild(footer);

        return footerRow;
        },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "DATA") {
            var animationSpeed = this.config.animationSpeed;
            if (this.loaded) {
                animationSpeed = 0;
            }
            this.fetchedData = payload;
            this.loaded = true;
            this.updateDom(animationSpeed);

        } else if (notification === "ERROR") {
                // TODO: Update front-end to display specific error.
        }
    },

});
