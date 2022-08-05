import * as moment from 'moment';

export const settingConfig = {

  getYearAndMonth(minYear, maxYear, type?: string) {
    let startYear;
    let endYear;
    let yearDiff;
    if (type == 'dob') {
      startYear = minYear;
      endYear = parseInt(moment(moment().subtract(maxYear, 'years')).format('YYYY'));
    } else {
      startYear = moment().subtract(minYear, 'years');
      endYear = moment().subtract(maxYear, 'years');
      yearDiff = maxYear ? moment(startYear).diff(moment(endYear), 'years', false) : moment(endYear).diff(moment(startYear), 'years', false);
    }

    let year = [];
    let days = [];
    let months = [{ name: 'January', value: 0 }, { name: 'February', value: 1 }, { name: 'March', value: 2 },
    { name: 'April', value: 3 }, { name: 'May', value: 4 }, { name: 'June', value: 5 },
    { name: 'July', value: 6 }, { name: 'August', value: 7 }, { name: 'September', value: 8 },
    { name: 'October', value: 9 }, { name: 'November', value: 10 }, { name: 'December', value: 11 }];
    if (type != 'dob') {
      for (let i = 0; i <= yearDiff; i++) {
        let toAddYear = moment(startYear).add(i, 'years');
        let extractedYear = moment(toAddYear, "DD/MM/YYYY").year();
        year.push(extractedYear);
      }
    } else {
      for (let i = startYear; i <= endYear; i++) {
        year.push(i);
      }
    }
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return { months, year, days }
  },

  getAlphabetByIndex(index) {
    let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    return alphabet[index];
  }
}
