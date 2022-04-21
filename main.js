const { Name, Fullname } = require('./modules/name.js');

let fullnames = [];
let names = []

function isValid(stringPair) {
  return Boolean(stringPair.match(/^([A-Z][a-zA-Z]*)\s([A-Z][a-zA-Z]*)$/));
}

function extractNamesFrom(stringPair) {
  return stringPair.split(' ');
}

function addName(value) {
  newName = names.find( name => name.value === value );
  if (!newName) { 
    newName = new Name(value);
    names.push(newName);
  }
  newName.incrementCount();
  return newName;
}

function addFullname(value) {
  [firstString, secondString] = extractNamesFrom(value);

  let firstname = addName(firstString);
  let lastname = addName(secondString);

  let fullname = new Fullname(firstname, lastname);
  fullnames.push(fullname);
  return fullname;
}

function readDataFrom(stringPairs) {
  stringPairs.forEach((stringPair, index) => {
    try {
      if (isValid(stringPair)) { 
        addFullname(stringPair);
      }
      else { 
        throw `The string pair \"${stringPair}\" at index ${index} ` +
              `does not respect the expected format (two capitalized ` +
              `strings separated by a single space) and was therefore ` +
              `ignored.\n`; 
      }
    }
    catch(error) {
      process.stdout.write(error);
    }
  });
}

function createNicknamesForUniqueNames() {
  let uniqueNames = getNamesWithCountOf1();
  while(uniqueNames.length) {
    reduceUniqueNames(uniqueNames);
    updateUnattributedNames();
    
    uniqueNames = getNamesWithCountOf1();
  }
}

function createNicknamesForExceedingFullnames() {
  let exceedingFullnames = getExceedingFullnames();
  if (exceedingFullnames.length) {
    reduceExceedingFullnames(exceedingFullnames);
    updateUnattributedNames();

    console.table(fullnames);
    console.table(names);
  }
}

function createNicknamesForCircularFullnames() {
  if (getFullnamesWithoutNicknames().length === getNamesWithCountOf2().length) {
    let circularFullnames = getFullnamesWithoutNicknames();
    if (circularFullnames.length) {
      circularFullnames[0].nickname = circularFullnames[0].firstname;
      updateUnattributedNames();
    }
  }
}

function reduceExceedingFullnames(exceedingFullnames) {
  exceedingFullnames.forEach( fullname => fullname.nickname = new Name(fullname.lastname.value + fullname.firstname.value));
}

function reduceUniqueNames() {
  let unassignedFullnames = getFullnamesWithoutNicknames();
  let uniqueNames = getNamesWithCountOf1();
  uniqueNames.forEach( uniqueName => {
    let matchingFullname = unassignedFullnames.find( fullname => 
      ( fullname.firstname.value === uniqueName.value ||
      fullname.lastname.value === uniqueName.value )
    );

    matchingFullname.nickname = uniqueName;
    names.find( name => name.value === uniqueName.value ).decrementCount();
  });
}

function initializeCounts() {
  names.forEach( name => {
    let count = fullnames.reduce((accumulator, fullname) => {
      return accumulator + (fullname.firstname.value === name.value ? 1 : 0) + (fullname.lastname.value === name.value ? 1 : 0);
    }, 0);
    name.initialCount = count;
    name.remainingCount = count;
  });
}

function updateUnattributedNames() {
  let assignedNames = getFullnamesWithNicknames().map( fullname => fullname.nickname );
  names.forEach( name => name.remainingCount = 0);

  fullnames.forEach( fullname => {
    if (fullname.nickname === null) {
      if (assignedNames.includes(fullname.firstname)) { fullname.firstname.remainingCount = 0; }
      else { fullname.firstname.incrementCount(); }
      if (assignedNames.includes(fullname.lastname)) { fullname.lastname.remainingCount = 0; }
      else { fullname.lastname.incrementCount(); }
    }
  });
}

function getNamesWithCountOf1() {
  return names.filter( name => name.remainingCount === 1 );
}

function getNamesWithCountOf2() {
  return names.filter( name => name.remainingCount === 2 );
}

function getNamesWithCountOfMoreThan1() {
  return names.filter( name => name.remainingCount > 1 );
}

function getFullnamesWithNicknames() {
  return fullnames.filter( fullname => fullname.hasNickname() );
}

function getFullnamesWithoutNicknames() {
  return fullnames.filter( fullname => !fullname.hasNickname() );
}

function getExceedingFullnames() {
  let remainingFullnames = getFullnamesWithoutNicknames();
  let remainingNames = getNamesWithCountOfMoreThan1();

  let numberExceedingFullnames = remainingFullnames.length - remainingNames.length;
  if (numberExceedingFullnames > 0) {
    let exceedingFullnames = remainingFullnames.sort( fullname => fullname.firstname.remainingCount + fullname.lastname.remainingCount ).reverse().slice(0, numberExceedingFullnames);
    return exceedingFullnames;
  }
  return [];
}

function createNicknamesForUniqueNames() {
  let uniqueNames = getNamesWithCountOf1();
  while(uniqueNames.length) {
    reduceUniqueNames(uniqueNames);
    updateUnattributedNames();
    
    uniqueNames = getNamesWithCountOf1();
  }
}

function createNicknamesForExceedingFullnames() {
  let exceedingFullnames = getExceedingFullnames();
  if (exceedingFullnames.length) {
    reduceExceedingFullnames(exceedingFullnames);
    updateUnattributedNames();
  }
}

function createNicknamesForCircularFullnames() {
  if (getFullnamesWithoutNicknames().length === getNamesWithCountOf2().length) {
    let circularFullnames = getFullnamesWithoutNicknames();
    if (circularFullnames.length) {
      circularFullnames[0].nickname = circularFullnames[0].firstname;
      updateUnattributedNames();
    }
  }
}

function uniqueNicknames(arrayStringPairs) {
  // Store the first and lastname from each valid string pair in a fullnames array as well as 
  // initializes nicknames to null, and, store each name in a separate array with its initial and 
  // remaining counts in the fullnames array
  readDataFrom(arrayStringPairs);
  initializeCounts();

  // Evaluate the list  of remaining fullnames without nickname
  while(getFullnamesWithoutNicknames().length) {
    // While not empty, create nicknames for the fullnames using either the firstname or the 
    // lastname with a unique occurrence, or when after reduction of the remaining occurences 
    // only one occurence is left, hence no possible ambiguity for the use of the nickname
    createNicknamesForUniqueNames();
    // If there are more fullnames expecting a nickname than available firstnames or lastnames,
    // the difference shall give the number of made up nicknames
    createNicknamesForExceedingFullnames();
    // What is left if the same number of remaining firstnames or lastnames as the number of 
    // nicknames, one shall be taken as a nickname for each remaining nickname respecting the
    // remaining occurences
    createNicknamesForCircularFullnames()
  }

  console.log("TABLE OF FULLNAMES:");
  console.table(fullnames);
  console.log("TABLE OF NAMES:")
  console.table(names);

  const nicknames = fullnames.map( fullname => fullname.nickname.value );

  console.log("TABLE OF UNIQUE NICKNAMES:")
  console.table(nicknames);

  return nicknames;
}

arrayStringPairs =  [ "Alan James",
                      "James Oliver",
                      "Oliver Max",
                      "Max Alan",
                      "Max Oliver",
                      "James Max",
                      "Ali Baba" ];

uniqueNicknames(arrayStringPairs);








