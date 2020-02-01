const url = require('url');
const fs = require('fs');
const stream = require('stream');
const readline = require('readline');
const { once } = require('events');

const { badRequestResponse } = require('../utils');
const PAGINATION_SIZE = 10;

exports.getLogs = getLogs = async (req, res) => {
    let queryParams = url.parse(req.url, true).query;
    const {page, startTime, endTime} = queryParams;
    const startTimeDate = startTime ? new Date(startTime) : new Date(2019, 0, 1); // start logs from jan 1, 2019
    const endTimeDate = endTime ? new Date(endTime) : new Date();
    let logsCount = page && page !== '0' ? page * PAGINATION_SIZE : PAGINATION_SIZE;

    if (startTime >= endTime) {
        return badRequestResponse(res);
    }

    let logsArray = await getResults('logs.txt', startTimeDate, endTimeDate, logsCount, true);
    let result = {logs: logsArray};

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(result));
    res.end();
};

exports.getLogsText = getLogsText = async (req, res) => {
    let queryParams = url.parse(req.url, true).query;
    const {page, startTime, endTime} = queryParams;
    const startTimeDate = startTime ? new Date(startTime) : new Date(2019, 0, 1); // start logs from jan 1, 2019
    const endTimeDate = endTime ? new Date(endTime) : new Date();
    let logsCount = page && page !== '0' ? page * PAGINATION_SIZE : PAGINATION_SIZE;

    if (startTime >= endTime) {
        return badRequestResponse(res);
    }

    let result = await getResults('logs.txt', startTimeDate, endTimeDate, logsCount, false);

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(JSON.stringify(result));
    res.end();
};

const getResults = async (fileName, startTimeDate, endTimeDate, logsCount, isJson) => {
    let result = isJson ? [] : '';
    const programStartTime = new Date().getMilliseconds();

    const fileSize = fs.statSync(fileName).size;
    // const startIndex = 0;
    const startIndex = await getStartIndex(fileName, fileSize, startTimeDate);
    const readInterface = readline.createInterface({
        input: fs.createReadStream(fileName, {start: startIndex}),
        output: new stream()
    });

    let resultsCount = 1;
    for await (const line of readInterface) {
        if ((logsCount - PAGINATION_SIZE) >= resultsCount) {
            resultsCount++;
            continue;
        } else if (logsCount < resultsCount) {
            break;
        }
        const lineArray = line.split(' ');
        const date = new Date(lineArray[0]);

        if (date >= startTimeDate && date <= endTimeDate) {
            if (isJson) {
                result = [...result, line]
            } else {
                result += line + '<br>';
            }
            resultsCount++;
        } else if (date > endTimeDate) {
            break;
        }
    }

    const programEndTIme = new Date().getMilliseconds();
    console.log('RUN TIME: ', programEndTIme - programStartTime);

    return result;
};

// Search for date using binary search algorithm may require some extra computation resources, but it will be fast
const getStartIndex = async (fileName, fileSize, startTimeDate) => {
    let startIndex = 0;
    let i = 0;
    let endIndex = fileSize;
    while (true) {
        let midIndex = Math.floor((startIndex + endIndex) / 2);
        const readInterface = readline.createInterface({
            input: fs.createReadStream(fileName, {start: midIndex}),
            output: new stream()
        });
        let lineDate;
        for await (const line of readInterface) {
            lineDate = new Date(line.split(' ')[0]);
            if (isNaN(lineDate.getTime())) {
                continue;
            }
            break;
        }

        if (startIndex === midIndex) {
            return startIndex;
        } else if (endIndex === midIndex) {
            return endIndex;
        }

        if (lineDate.getTime() === startTimeDate.getTime()) {
            return startIndex;
        } else if (lineDate > startTimeDate) {
            endIndex = midIndex;
        } else if (lineDate < startTimeDate) {
            startIndex = midIndex;
        }
    }
};