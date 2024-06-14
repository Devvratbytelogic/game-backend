// JOB to check the status of invoice and if status is paid we archive the record
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = resolve(__dirname, '../cron-data/invoice.json');
const jsonData = fs.readFileSync(filePath, 'utf-8');
const invoices = JSON.parse(jsonData);

export function startCronJobs() {
    const archiveInvoiceTask = () => {
        // console.log('Running archive invoice task:', new Date());
        try {
            const paidInvoices = invoices.filter((item) => {
                return item.status === 'paid'
            })
            if (paidInvoices.length > 0) {
                paidInvoices.forEach((item) => {
                    invoices.splice(invoices.findIndex((e) => e.status === item.status), 1);
                });
                // console.log('the paid are', invoices);
                fs.writeFileSync(
                    resolve(__dirname, '../cron-data/invoice.json'),
                    JSON.stringify(invoices),
                    'utf-8'
                );
                fs.writeFileSync(
                    resolve(__dirname, '../cron-data/archive.json'),
                    JSON.stringify(paidInvoices),
                    'utf-8'
                );
            }
        } catch (err) {
            console.log('Some error are occurred during cron job ', err);
        }
        // console.log('Archive invoice task ended:', new Date());
    };

    cron.schedule('*/30 * * * * *', archiveInvoiceTask);
    // (* * * * * *) every second // (*/3 * * * * *) every second you want that is optional
    // (*/1 * * * *) every minutes // (*/3 * * * * *) every minutes you want
    // (* */1 * * *) every hour // (*/3 * * * * *) every hour you want
    // (* * */day * *) every day // (*/3 * * * * *) every day you want
    // 🌟🌟🌟🌟 follow for more information https://crontab.guru/
}


// HouseKeepin of records older than 180 days
const archivefilePath = resolve(__dirname, '../cron-data/archive.json');
const archivejsonData = fs.readFileSync(archivefilePath, 'utf-8');
const archive = JSON.parse(archivejsonData);
// console.log(archive);
export function housekeepingCronJobs() {
    const housekeepingTask = () => {
        console.log('Running archive invoice task:', new Date());
        try {
            archive.map((item, index) => {
                const presentDate = new Date().getTime()
                const recordDate = new Date(item.date).getTime()
                console.log('the number of days:', Math.floor((presentDate - recordDate) / (1000 * 60 * 60 * 24)));
                if (Math.floor((presentDate - recordDate) / (1000 * 60 * 60 * 24)) > 180) {
                    archive.splice(index, 1);
                    fs.writeFileSync(
                        resolve(__dirname, '../cron-data/archive.json'),
                        JSON.stringify(archive),
                        'utf-8'
                    );
                }
            })
        } catch (err) {
            console.log('Some error are occurred during cron job ', err);
        }
        console.log('Archive invoice task ended:', new Date());
    };

    cron.schedule('*/30 * * * * *', housekeepingTask);
}
