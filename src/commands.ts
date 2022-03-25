import { client, apiKey } from './index'
import DiscordJS from "discord.js";
import urllib from 'urllib';

function kelToFahr(kel) {
    return Math.round(((kel - 273.15) * (9 / 5) + 32) * 100) / 100;
};

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
    var city;

    urllib.request(url).then(data => {
        const response = data.data;
        const responseJSON = JSON.parse(response.toString());
        return responseJSON;
    }).catch(err => {
        console.log(err);
    }).then(responseJSON => {
        const lat = responseJSON.coord.lat;
        const lon = responseJSON.coord.lon;
        city = responseJSON.name;
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&appid=${apiKey}`;
        urllib.request(url).then(data => {
            const response = data.data;
            const responseJSON = JSON.parse(response.toString());
            return responseJSON;
        }).catch(err => {
            console.log(err);
        }).then(responseJSON => {
            const offset = responseJSON.timezone_offset;

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
            for (let i = 1; i < 7; i++) {
                const time = new Date((hourly[i].dt) * 1000);
                const timeString = time.toLocaleTimeString();
                const temp = kelToFahr(hourly[i].temp);
                const feelsLike = kelToFahr(hourly[i].feels_like);
                const weather = hourly[i].weather[0].main;
                const description = hourly[i].weather[0].description;

                embed.addFields(
                    { name: `Time`, value: `${timeString}`, inline: true },
                    { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                )
            }
            for (let i = 7; i < 13; i++) {
                const time = new Date((hourly[i].dt) * 1000);
                const timeString = time.toLocaleTimeString();
                const temp = kelToFahr(hourly[i].temp);
                const feelsLike = kelToFahr(hourly[i].feels_like);
                const weather = hourly[i].weather[0].main;
                const description = hourly[i].weather[0].description;

                embed2.addFields(
                    { name: `Time`, value: `${timeString}`, inline: true },
                    { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                )
            }
            for (let i = 13; i < 19; i++) {
                const time = new Date((hourly[i].dt) * 1000);
                const timeString = time.toLocaleTimeString();
                const temp = kelToFahr(hourly[i].temp);
                const feelsLike = kelToFahr(hourly[i].feels_like);
                const weather = hourly[i].weather[0].main;
                const description = hourly[i].weather[0].description;

                embed3.addFields(
                    { name: `Time`, value: `${timeString}`, inline: true },
                    { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                )
            }
            for (let i = 19; i < 25; i++) {
                const time = new Date((hourly[i].dt) * 1000);
                const timeString = time.toLocaleTimeString();
                const temp = kelToFahr(hourly[i].temp);
                const feelsLike = kelToFahr(hourly[i].feels_like);
                const weather = hourly[i].weather[0].main;
                const description = hourly[i].weather[0].description;

                embed4.addFields(
                    { name: `Time`, value: `${timeString}`, inline: true },
                    { name: `Temperature`, value: `${temp}°F (Feels like: ${feelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${weather} (${description})`, inline: true },
                )
            }

            const pages = [embed, embed2, embed3, embed4];
            var page = 0;

            message.channel.send({embeds: [pages[page]]}).then(hourlyEmbeded => {
                hourlyEmbeded.react('⏪');
                hourlyEmbeded.react('⏩');

                const filter = (reaction, user) => ['⏪', '⏩'].includes(reaction.emoji.name) && (user.id === message.author.id);
                const collector = hourlyEmbeded.createReactionCollector(filter);

                collector.on('collect', async (reaction, user) => {
                    if (reaction.emoji.name === '⏪') {
                        page = (page === 0) ? pages.length - 1 : page - 1;
                    } else if (reaction.emoji.name === '⏩') {
                        page = (page === pages.length - 1) ? 0 : page + 1;
                    }
                    await hourlyEmbeded.edit({embeds: [pages[page]]});
                    if (user.id !== client.user?.id) {
                        reaction.users.remove(user);
                    }
                });
            });
        });
    });
};