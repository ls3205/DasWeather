import { client, apiKey } from './index'
import DiscordJS from "discord.js";
import urllib from 'urllib';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function kelToFahr(kel) {
    return Math.round(((kel - 273.15) * (9 / 5) + 32) * 100) / 100;
};

function unixToReadable(unix) {
    const date = new Date(unix * 1000);
    const dateString = `${date.toLocaleTimeString().split(':', 2).join(':')} ${date.toLocaleTimeString().substring(date.toLocaleTimeString().indexOf(' ') + 1)}`;
    return dateString;
}

function qnhToinhg(qnh) {
    return Math.round((qnh * 0.02953) * 100) / 100;
}

export async function now(message, zipcode) {
    console.log(`Using NOW function (zipcode: ${zipcode}). (${message.author.username})`);
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${apiKey}`;
    urllib.request(url, (err, data, res) => {
        if (err) {
            console.log(err);
        }
        const response = JSON.parse(String(data));

        if (response.cod === "404") return;

        const temperature = kelToFahr(response.main.temp);
        const feelsLike = kelToFahr(response.main.feels_like);
        const kelvin = response.main.temp;

        const weather = response.weather[0].main;
        const description = response.weather[0].description;

        const city = response.name;
        const lat = response.coord.lat;
        const lon = response.coord.lon;

        const embed = new DiscordJS.MessageEmbed()
            .setColor('#03adfc')
            .setTitle(`Current Weather`)
            .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
            .addFields(
                { name: 'Temperature', value: `${temperature}°F (${kelvin}°K)`, inline: true },
                { name: 'Feels Like', value: `${feelsLike}°F`, inline: true },
                { name: 'Weather', value: `${weather} (${description})`, inline: true },
            )
            .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + response.weather[0].icon + '@2x.png' })

        message.channel.send({ embeds: [embed] });
    });

};

export async function hourly(message, zipcode) {
    console.log(`Using HOURLY function (zipcode: ${zipcode}). (${message.author.username})`);

    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${apiKey}`;

    urllib.request(url).then(data => {
        const response = data.data;
        const responseJSON = JSON.parse(response.toString());
        if (responseJSON.cod === "404") return;
        return responseJSON;
    }).catch(err => {
        console.log(err);
    }).then(responseJSON => {
        const lat = responseJSON.coord.lat;
        const lon = responseJSON.coord.lon;
        const city = responseJSON.name;
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&appid=${apiKey}`;
        urllib.request(url).then(data => {
            const response = data.data;
            const responseJSON = JSON.parse(response.toString());
            if (responseJSON.cod === "404") return;
            return responseJSON;
        }).catch(err => {
            console.log(err);
        }).then(responseJSON => {
            const current = responseJSON.current;
            const currentTemp = kelToFahr(current.temp);
            const currentFeelsLike = kelToFahr(current.feels_like);
            const currentWeather = current.weather[0].main;
            const currentDescription = current.weather[0].description;

            const embed = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Hourly Weather`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .addFields(
                    { name: 'Time', value: 'Now', inline: true },
                    { name: 'Temperature', value: `${currentTemp}°F (Feels like: ${currentFeelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${currentWeather} (${currentDescription})`, inline: true },
                )
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + current.weather[0].icon + '@2x.png' })
                .setFooter('Page 1 of 4');

            const embed2 = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Hourly Weather`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + current.weather[0].icon + '@2x.png' })
                .setFooter('Page 2 of 4');

            const embed3 = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Hourly Weather`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + current.weather[0].icon + '@2x.png' })
                .setFooter('Page 3 of 4');

            const embed4 = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Hourly Weather`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + current.weather[0].icon + '@2x.png' })
                .setFooter('Page 4 of 4');

            const hourly = responseJSON.hourly;

            const pages = [embed, embed2, embed3, embed4];
            var page = 0;

            for (let j = 0; j < pages.length; j++) {
                for (let i = (j * 6) + 1; i < (j * 6) + 7; i++) {
                    const time = new Date((hourly[i].dt) * 1000);
                    const timeString = `${days[time.getDay()]} ${unixToReadable(hourly[i].dt)}`;
                    const temp = kelToFahr(hourly[i].temp);
                    const feelsLike = kelToFahr(hourly[i].feels_like);
                    const weather = hourly[i].weather[0].main;
                    const description = hourly[i].weather[0].description;

                    pages[j].addFields(
                        { name: `Time`, value: `${timeString}`, inline: true },
                        { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                        { name: 'Weather', value: `${weather} (${description})`, inline: true },
                    )
                }
            }

            message.channel.send({ embeds: [pages[page]] }).then(hourlyEmbeded => {
                hourlyEmbeded.react('⏪');
                hourlyEmbeded.react('⏩');

                const filter = (reaction, user) => ['⏪', '⏩'].includes(reaction.emoji.name) && (user.id === message.author.id);
                const collector = hourlyEmbeded.createReactionCollector(filter);

                collector.on('collect', async (reaction, user) => {
                    if (user.id !== client.user?.id) {
                        if (reaction.emoji.name === '⏪') {
                            page = (page === 0) ? pages.length - 1 : page - 1;
                        } else if (reaction.emoji.name === '⏩') {
                            page = (page === pages.length - 1) ? 0 : page + 1;
                        }
                        await hourlyEmbeded.edit({ embeds: [pages[page]] });
                        reaction.users.remove(user);
                    }
                });
            });
        });
    });
};

export async function today(message, zipcode, channel=message.channel) {
    console.log(`Using TODAY function (zipcode: ${zipcode}).`);

    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${apiKey}`;

    urllib.request(url).then(data => {
        const response = data.data;
        const responseJSON = JSON.parse(response.toString());
        if (responseJSON.cod === "404") return;
        return responseJSON;
    }).catch(err => {
        console.log(err);
    }).then(responseJSON => {
        const city = responseJSON.name;

        const lat = responseJSON.coord.lat;
        const lon = responseJSON.coord.lon;

        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${apiKey}`;

        urllib.request(url).then(data => {
            const response = data.data;
            const responseJSON = JSON.parse(response.toString());
            if (responseJSON.cod === "404") return;
            return responseJSON;
        }).catch(err => {
            console.log(err);
        }).then(responseJSON => {

            const hourlyFuture = responseJSON.hourly;

            const current = responseJSON.current;
            const currentTemp = kelToFahr(current.temp);

            const today = responseJSON.daily[0];
            const highTemp = kelToFahr(today.temp.max);
            const lowTemp = kelToFahr(today.temp.min);
            const weather = today.weather[0].main;
            const description = today.weather[0].description;
            const sunrise = unixToReadable(today.sunrise);
            const sunset = unixToReadable(today.sunset);
            const windSpeed = today.wind_speed;
            const windGust = today.wind_gust;
            const windDirection = today.wind_deg;
            const humidity = today.humidity;
            const pressure = qnhToinhg(today.pressure);
            const dewpoint = kelToFahr(today.dew_point);
            const uvIndex = Math.round(today.uvi);

            const embed = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Weather Today`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .addFields(
                    { name: 'Temperature', value: `${currentTemp}°F (${highTemp}°F/${lowTemp}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                    { name: 'Humidity', value: `${humidity}%`, inline: true },
                    { name: 'Wind', value: `${windSpeed} mph/Gust ${windGust} mph (${windDirection}°)`, inline: true },
                    { name: 'Sunrise', value: `${sunrise}`, inline: true },
                    { name: 'Sunset', value: `${sunset}`, inline: true },
                    { name: 'UV Index', value: `${uvIndex}`, inline: true },
                    { name: 'Pressure', value: `${pressure} inHg`, inline: true },
                    { name: 'Dewpoint', value: `${dewpoint}°F`, inline: true },
                )
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + today.weather[0].icon + '@2x.png' })
                .setFooter('Page 1 of 5');

            const time = new Date();
            time.setHours(0);
            time.setMinutes(0);
            time.setSeconds(0);
            time.setMilliseconds(0);
            const timeMilis = time.getTime();
            const unix = (timeMilis / 1000);

            const url = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${unix}&appid=${apiKey}`;
            urllib.request(url).then(data => {
                const response = data.data;
                const responseJSON = JSON.parse(response.toString());
                if (responseJSON.cod === "404") return;
                return responseJSON;
            }).catch(err => {
                console.log(err);
            }).then(responseJSON => {
                const hourlyPast = responseJSON.hourly;
                var hourly = [];
                var pointerPast = 0;
                var pointerFuture = 0;
                var pointerEndFuture = 0;
                const endUnix = unix + 86400;

                for (let i = 0; i < hourlyPast.length; i++) {
                    if (hourlyPast[i].dt === unix) {
                        pointerPast = i;
                        break;
                    }
                }
                for (let j = 0; j < hourlyFuture.length; j++) {
                    if (hourlyFuture[j].dt === hourlyPast[pointerPast].dt) {
                        pointerFuture = j;
                    }
                    if (hourlyFuture[j].dt === endUnix) {
                        pointerEndFuture = j;
                    }
                }
                for (let i = pointerPast; i < hourlyPast.length; i++) {
                    // @ts-ignore
                    hourly.push(hourlyPast[i]);
                }
                for (let i = pointerFuture; i < pointerEndFuture; i++) {
                    // @ts-ignore
                    hourly.push(hourlyFuture[i]);
                }

                const embed2 = new DiscordJS.MessageEmbed()
                    .setColor('#03adfc')
                    .setTitle(`Hourly Weather`)
                    .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                    .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + today.weather[0].icon + '@2x.png' })
                    .setFooter('Page 2 of 5');

                const embed3 = new DiscordJS.MessageEmbed()
                    .setColor('#03adfc')
                    .setTitle(`Hourly Weather`)
                    .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                    .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + today.weather[0].icon + '@2x.png' })
                    .setFooter('Page 3 of 5');

                const embed4 = new DiscordJS.MessageEmbed()
                    .setColor('#03adfc')
                    .setTitle(`Hourly Weather`)
                    .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                    .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + today.weather[0].icon + '@2x.png' })
                    .setFooter('Page 4 of 5');

                const embed5 = new DiscordJS.MessageEmbed()
                    .setColor('#03adfc')
                    .setTitle(`Hourly Weather`)
                    .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                    .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + today.weather[0].icon + '@2x.png' })
                    .setFooter('Page 5 of 5');


                const pages = [embed, embed2, embed3, embed4, embed5];
                var page = 0;

                for (let i = 0; i < 6; i++) {
                    // @ts-ignore
                    const timeString = `${unixToReadable(hourly[i].dt)}`;
                    const temp = kelToFahr(hourly[i].temp);
                    const feelsLike = kelToFahr(hourly[i].feels_like);
                    const weather = hourly[i].weather[0].main;
                    const description = hourly[i].weather[0].description;

                    pages[1].addFields(
                        { name: `Time`, value: `${timeString}`, inline: true },
                        { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                        { name: 'Weather', value: `${weather} (${description})`, inline: true },
                    )
                }
                for (let i = 6; i < 12; i++) {
                    const timeString = `${unixToReadable(hourly[i].dt)}`;
                    const temp = kelToFahr(hourly[i].temp);
                    const feelsLike = kelToFahr(hourly[i].feels_like);
                    const weather = hourly[i].weather[0].main;
                    const description = hourly[i].weather[0].description;

                    pages[2].addFields(
                        { name: `Time`, value: `${timeString}`, inline: true },
                        { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                        { name: 'Weather', value: `${weather} (${description})`, inline: true },
                    )
                }
                for (let i = 12; i < 18; i++) {
                    const timeString = `${unixToReadable(hourly[i].dt)}`;
                    const temp = kelToFahr(hourly[i].temp);
                    const feelsLike = kelToFahr(hourly[i].feels_like);
                    const weather = hourly[i].weather[0].main;
                    const description = hourly[i].weather[0].description;

                    pages[3].addFields(
                        { name: `Time`, value: `${timeString}`, inline: true },
                        { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                        { name: 'Weather', value: `${weather} (${description})`, inline: true },
                    )
                }
                for (let i = 18; i < 25; i++) {
                    const timeString = `${unixToReadable(hourly[i].dt)}`;
                    const temp = kelToFahr(hourly[i].temp);
                    const feelsLike = kelToFahr(hourly[i].feels_like);
                    const weather = hourly[i].weather[0].main;
                    const description = hourly[i].weather[0].description;

                    pages[4].addFields(
                        { name: `Time`, value: `${timeString}`, inline: true },
                        { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                        { name: 'Weather', value: `${weather} (${description})`, inline: true },
                    )
                }

                channel.send({ embeds: [pages[page]] }).then(hourlyEmbeded => {
                    hourlyEmbeded.react('⏪');
                    hourlyEmbeded.react('⏩');

                    const filter = (reaction, user) => ['⏪', '⏩'].includes(reaction.emoji.name) && (user.id === message.author.id);
                    const collector = hourlyEmbeded.createReactionCollector(filter);

                    collector.on('collect', async (reaction, user) => {
                        if (user.id !== client.user?.id) {
                            if (reaction.emoji.name === '⏪') {
                                page = (page === 0) ? pages.length - 1 : page - 1;
                            } else if (reaction.emoji.name === '⏩') {
                                page = (page === pages.length - 1) ? 0 : page + 1;
                            }
                            await hourlyEmbeded.edit({ embeds: [pages[page]] });
                            reaction.users.remove(user);
                        }
                    });
                });
            });
        });
    });
};

export async function tomorrow(message, zipcode) {
    console.log(`Using TOMORROW function (zipcode: ${zipcode})`);
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${apiKey}`;

    urllib.request(url).then(data => {
        const response = data.data;
        const responseJSON = JSON.parse(response.toString());
        if (responseJSON.cod === "404") return;
        return responseJSON;
    }).catch(err => {
        console.log(err);
    }).then(responseJSON => {
        const city = responseJSON.name;
        const lat = responseJSON.coord.lat;
        const lon = responseJSON.coord.lon;
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,alerts,minutely&appid=${apiKey}`;

        urllib.request(url).then(data => {
            const response = data.data;
            const responseJSON = JSON.parse(response.toString());
            if (responseJSON.cod === "404") return;
            return responseJSON;
        }).catch(err => {
            console.log(err);
        }).then(responseJSON => {
            const tomorrow = responseJSON.daily[1];
            const unixStart = tomorrow.dt - 43200;
            const unixEnd = unixStart + 86400;
            var pointerStart = 0;
            var pointerEnd = 0;
            const fullListHourly = responseJSON.hourly;
            var hourly = [];
            for (var hours of fullListHourly) {
                if (hours.dt === unixStart) {
                    pointerStart = fullListHourly.indexOf(hours);
                }
                if (hours.dt === unixEnd) {
                    pointerEnd = fullListHourly.indexOf(hours);
                }
            }
            for (let i = pointerStart; i <= pointerEnd; i++) {
                hourly.push(fullListHourly[i]);
            }

            const dayTemp = kelToFahr(tomorrow.temp.day);
            const highTemp = kelToFahr(tomorrow.temp.max);
            const lowTemp = kelToFahr(tomorrow.temp.min);
            const weather = tomorrow.weather[0].main;
            const description = tomorrow.weather[0].description;
            const sunrise = unixToReadable(tomorrow.sunrise);
            const sunset = unixToReadable(tomorrow.sunset);
            const windSpeed = tomorrow.wind_speed;
            const windGust = tomorrow.wind_gust;
            const windDirection = tomorrow.wind_deg;
            const humidity = tomorrow.humidity;
            const pressure = qnhToinhg(tomorrow.pressure);
            const dewpoint = kelToFahr(tomorrow.dew_point);
            const uvIndex = Math.round(tomorrow.uvi);

            const embed = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Weather Tomorrow`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .addFields(
                    { name: 'Temperature', value: `${dayTemp}°F (${highTemp}°F/${lowTemp}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                    { name: 'Humidity', value: `${humidity}%`, inline: true },
                    { name: 'Wind', value: `${windSpeed} mph/Gust ${windGust} mph (${windDirection}°)`, inline: true },
                    { name: 'Sunrise', value: `${sunrise}`, inline: true },
                    { name: 'Sunset', value: `${sunset}`, inline: true },
                    { name: 'UV Index', value: `${uvIndex}`, inline: true },
                    { name: 'Pressure', value: `${pressure} inHg`, inline: true },
                    { name: 'Dewpoint', value: `${dewpoint}°F`, inline: true },
                )
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + tomorrow.weather[0].icon + '@2x.png' })
                .setFooter('Page 1 of 5');

            const embed2 = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Hourly Weather`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + tomorrow.weather[0].icon + '@2x.png' })
                .setFooter('Page 2 of 5');

            const embed3 = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Hourly Weather`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + tomorrow.weather[0].icon + '@2x.png' })
                .setFooter('Page 3 of 5');

            const embed4 = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Hourly Weather`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + tomorrow.weather[0].icon + '@2x.png' })
                .setFooter('Page 4 of 5');

            const embed5 = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Hourly Weather`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + tomorrow.weather[0].icon + '@2x.png' })
                .setFooter('Page 5 of 5');


            const pages = [embed, embed2, embed3, embed4, embed5];
            var page = 0;

            for (let i = 0; i < 6; i++) {
                // @ts-ignore
                const timeString = `${unixToReadable(hourly[i].dt)}`;
                const temp = kelToFahr(hourly[i].temp);
                const feelsLike = kelToFahr(hourly[i].feels_like);
                const weather = hourly[i].weather[0].main;
                const description = hourly[i].weather[0].description;

                pages[1].addFields(
                    { name: `Time`, value: `${timeString}`, inline: true },
                    { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                )
            }
            for (let i = 6; i < 12; i++) {
                const timeString = `${unixToReadable(hourly[i].dt)}`;
                const temp = kelToFahr(hourly[i].temp);
                const feelsLike = kelToFahr(hourly[i].feels_like);
                const weather = hourly[i].weather[0].main;
                const description = hourly[i].weather[0].description;

                pages[2].addFields(
                    { name: `Time`, value: `${timeString}`, inline: true },
                    { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                )
            }
            for (let i = 12; i < 18; i++) {
                const timeString = `${unixToReadable(hourly[i].dt)}`;
                const temp = kelToFahr(hourly[i].temp);
                const feelsLike = kelToFahr(hourly[i].feels_like);
                const weather = hourly[i].weather[0].main;
                const description = hourly[i].weather[0].description;

                pages[3].addFields(
                    { name: `Time`, value: `${timeString}`, inline: true },
                    { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                )
            }
            for (let i = 18; i < 24; i++) {
                const timeString = `${unixToReadable(hourly[i].dt)}`;
                const temp = kelToFahr(hourly[i].temp);
                const feelsLike = kelToFahr(hourly[i].feels_like);
                const weather = hourly[i].weather[0].main;
                const description = hourly[i].weather[0].description;

                pages[4].addFields(
                    { name: `Time`, value: `${timeString}`, inline: true },
                    { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                )
            }

            message.channel.send({ embeds: [pages[page]] }).then(hourlyEmbeded => {
                hourlyEmbeded.react('⏪');
                hourlyEmbeded.react('⏩');

                const filter = (reaction, user) => ['⏪', '⏩'].includes(reaction.emoji.name) && (user.id === message.author.id);
                const collector = hourlyEmbeded.createReactionCollector(filter);

                collector.on('collect', async (reaction, user) => {
                    if (user.id !== client.user?.id) {
                        if (reaction.emoji.name === '⏪') {
                            page = (page === 0) ? pages.length - 1 : page - 1;
                        } else if (reaction.emoji.name === '⏩') {
                            page = (page === pages.length - 1) ? 0 : page + 1;
                        }
                        await hourlyEmbeded.edit({ embeds: [pages[page]] });
                        reaction.users.remove(user);
                    }
                });
            });
        });
    })
}

export async function dailyReminder(message, zipcode) {
    setInterval(async () => {
        var date = new Date();
        if (date.getHours() === 8 && date.getMinutes() === 0) {
            await today(message, zipcode, message.channel);
        }
    }, 60000);
}