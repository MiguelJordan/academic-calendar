const _ = require("lodash");

const schema = require("../models/Schemas");

async function auth(person) {
  let user;

  if (person._id[0] === "A") {
    person.accountType = "admin";
    user = await schema.Admin.findOne({
      _id: person._id,
      password: person.password,
    });
  } else if (person._id[0] === "U") {
    person.accountType = "user";
    user = await schema.Student.findOne({
      _id: person._id,
      password: person.password,
    });
  }
  return user;
}

async function compare(user_password, db_password) {
  let result;
  if (user_password === db_password) {
    result = true;
  } else {
    result = false;
  }
  return result;
}

function findElement(criteria = "_id", value, iterableCollection = []) {
  /**
   * function to simulate a database query from an iterable collection
   */
  // ***** Extra module `isEquivalent` *****

  // console.log(iterableCollection);

  if (iterableCollection.length === 0) {
    return undefined;
  }

  if (criteria === "week") {
    let index = 0;
    for (let element of iterableCollection) {
      if (element.week.firstDay === value.firstDay) {
        return { element, index };
      }
      index++;
    }
  } else {
    let index = 0;
    for (let element of iterableCollection) {
      if (
        isEquivalent(element[criteria], value) ||
        element[criteria] === value
      ) {
        return { element, index };
      }
      index++;
    }
  }
  return undefined;
}

function findDay(value, collection = []) {
  if (collection.length === 0) {
    return undefined;
  } else {
    let index = 0;
    for (let element of collection) {
      if (Object.keys(element)[0] === value) {
        return { element, index };
      }
      index++;
    }
  }
}

function isEquivalent(first, second) {
  // Just make sure the 2 objects do not have the same reference
  // Create array of property names

  // if (first === undefined && second !== undefined) {
  //     return false;
  // } else if (first !== undefined && second === undefined) {
  //     return false;
  // } else if (first === undefined && second === undefined) {
  //     return true;
  // }

  let propsFirst = Object.getOwnPropertyNames(first);
  let propsSecond = Object.getOwnPropertyNames(second);

  // if num of props of 2 objects are different, then the objects can't be equal
  if (propsFirst.length !== propsSecond.length) {
    return false;
  }

  // If values of same property are not equal,
  // objects are not equivalent
  for (let i = 0; i < propsFirst.length; i++) {
    if (first[propsFirst[i]] !== second[propsFirst[i]]) {
      return false;
    }
  }
  return true;
}
function dateInterval(start, stop) {
  let dt = new Date(start);
  let arr = [];
  for (arr = []; dt <= new Date(stop); dt.setDate(dt.getDate() + 1)) {
    arr.push(dt.toDateString());
  }
  return arr;
}

module.exports = {
  auth,
  findElement,
  findDay,
  dateInterval,
};
