const { Db } = require("mongodb");
const Schemas = require("../models/Schemas");
const { findElement, dateInterval } = require("../myFunctions/npmFunctions");
const { findDay } = require("../myFunctions/npmFunctions");

let admincontroller = {
  createAC: async (req, res) => {
    // let admin = await Admin.findOne({
    //   name: "Admin",
    // });

    let adminAC = req.body;
    let acExists = await Schemas.AC.findOne({ _id: adminAC._id });
    let resObject = { message: "" };

    if (acExists) {
      resObject.message = `Operation unsuccessful. AC of ${adminAC.start} to ${adminAC.stop} already exists`;
    } else {
      let AC = new Schemas.AC({
        _id: adminAC._id,
        start: adminAC.start,
        stop: adminAC.stop,
        days: [],
      });

      AC.save();
      resObject.message = `AC of ${adminAC.start} to ${adminAC.stop} created successfully`;
    }

    res.end(JSON.stringify(resObject));
  },

  getACs: async (req, res) => {
    let adminACs = req.body;
    let ACs = [];

    for (let AC of adminACs) {
      AC = await Schemas.AC.findOne({ _id: AC._id });
      if (AC) {
        ACs.push(AC);
      }
    }

    res.end(JSON.stringify(ACs));
  },

  updateAC: async (req, res) => {
    let data = req.body;
    let AC = await Schemas.AC.findOne({ _id: data.AC_id });
    let i,
      j = 0;

    data.days.forEach(async (day) => {
      console.log("day: ", day);
      day.date.forEach((Day) => {
        console.log("Day: ", Day);

        let oldDate = findElement("date", Day, AC.days);
        // console.log("OLDAY: ", oldDay, "\n", "EVENT: ", day);

        console.log("olDate: ", oldDate);

        if (oldDate) {
          if (
            day.events.name === AC.days[oldDate.index].events[j].name &&
            (day.events.start === AC.days[oldDate.index].events[j].start ||
              day.events.stop === AC.days[oldDate.index].events[j].stop)
          ) {
            console.log(" if statement");
          } else if (
            day.events.name !== AC.days[oldDate.index].events[j].name &&
            day.events.venue === AC.days[oldDate.index].events[j].venue &&
            (day.events.start === AC.days[oldDate.index].events[j].start ||
              day.events.stop === AC.days[oldDate.index].events[j].stop)
          ) {
            console.log(" else if statement");
          } else {
            AC.days[oldDate.index].events.push(day.events);
            AC.markModified("days");
            console.log("else statement");
          }

          //AC.days[oldDay.index] = { [Object.keys(event)[0]]: [event] };
        } else {
          AC.days.push({ date: Day, events: [day.events] });
        }
        j++;
      });

      i++;
    });
    new Notification(`A New Event on date ${Day} has been added`);
    await AC.save();
    res.end(JSON.stringify(AC));
  },

  viewAC: async (req, res) => {
    let data = req.body;
    let AC = await Schemas.AC.findOne({ _id: data.AC_id });
    let day = findElement("date", data.date, AC.days);

    if (day) {
      res.end(JSON.stringify(day.element.events));
    } else {
      res.end(JSON.stringify("undefined"));
    }
  },

  deleteAC: async (req, res) => {
    let data = req.body;
    let AC = await Schemas.AC.findOne({ _id: data.AC_id });

    data.element.forEach((elm) => {
      if (elm.id === "multiple") {
        let interval = dateInterval(elm.start, elm.stop);

        interval.forEach((day) => {
          let oldDays = findElement("date", day, AC.days);

          if (oldDays) {
            let Name = findElement(
              "name",
              elm.name,
              AC.days[oldDays.index].events
            );
            if (Name) {
              console.log(Name);
              AC.days[oldDays.index].events.splice(Name.index, 1);
              AC.markModified("days");
            }
          }
        });
      } else {
        console.log("elm: ", elm);
        let interval = dateInterval(elm.start, elm.stop);
        let interval1 = dateInterval(elm.start1, elm.stop1);
        let i = 0;

        console.log("interval:", interval, "\n", "interval1:", interval1);
        interval.forEach((day) => {
          let oldData = findElement("date", day, AC.days);
          let oldData1 = findElement("date", interval1[i], AC.days);

          console.log("oldData", oldData, "\n", "oldData1", oldData1);

          if (oldData) {
            let Name = findElement(
              "name",
              elm.name,
              AC.days[oldData.index].events
            );
            if (Name) {
              if (oldData1) {
                AC.days[oldData1.index].events.push(Name.element);
                AC.days[oldData.index].events.splice(Name.index, 1);
                AC.markModified("days");
              } else {
                AC.days.push({ date: interval1[i], events: [Name.element] });
                AC.days[oldData.index].events.splice(Name.index, 1);
                AC.markModified("days");
              }
            }
          }
          i++;
        });
      }
    });

    await AC.save();
    res.end(JSON.stringify(AC));
  },

  deleteOne: async (req, res) => {
    let data = req.body;
    let AC = await Schemas.AC.findOne({ _id: data.AC_id });
    let Oldday = findElement("date", data.elmt.date, AC.days);

    if (Oldday) {
      let targetName = findElement(
        "name",
        data.elmt.name,
        AC.days[Oldday.index].events
      );

      if (targetName) {
        AC.days[Oldday.index].events.splice(targetName.index, 1);
        AC.markModified("days");
      }
    }
    await AC.save();
    res.end(JSON.stringify(AC));
  },
};
module.exports = admincontroller;

/*
    let program = await Schemas.Program.findOne({ _id: data.week.firstDay });
    console.log("program: ", program);
    console.log("data.events: ", data.events);

    if (program) {
      let oldDay = findElement("date", data.date, program.Days);
      console.log(oldDay);
      console.log(typeof AC);
      if (oldDay) {
        program.Days[oldDay.index].events.push(data.events);
      } else {
        program.Days.push({ date: data.date, events: [data.events] });
      }
    } else {
      program = new Schemas.Program({
        _id: data.week.firstDay,
        AC: AC,
        Days: [
          {
            date: data.date,
            events: [data.events],
          },
        ],
      });
      console.log(program);
      AC.programs.push(program);
    }
    */
