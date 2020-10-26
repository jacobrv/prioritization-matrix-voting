function sendSelection(elem, severity, frequency) {
  var userId = window.userId;
  var roomId = window.roomId;

  if ($(elem).hasClass("selected")) {
    window.socket.emit("unvote", { userId, roomId });
  } else {
    window.socket.emit("vote", { severity, frequency, userId, roomId });
  }
}

function clearSelections(severity, frequency) {
  if (confirm("Are you sure you want to clear everyone's votes?")) {
    var userId = window.userId;
    var roomId = window.roomId;
    window.socket.emit("clear", { userId, roomId });
  }
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

$(function () {
  if (
    sessionStorage.getItem("userId") &&
    sessionStorage.getItem("userId").length > 0
  ) {
    window.userId = sessionStorage.getItem("userId");
  } else {
    window.userId = uuidv4();
    sessionStorage.setItem("userId", window.userId);
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has("room")) {
    window.roomId = params.get("room");
  } else {
    alert("Please enter through base url.");
  }

  var socket = io({
    query: {
      roomId,
    },
  });
  window.socket = socket;

  socket.on("vote", function (votes) {
    $("#results h3").text("");
    $(".selected").removeClass("selected");

    if (votes && votes.length > 0) {
      var msgs = [];
      var userId = window.userId;
      for (let i = 0; i < votes.length; i++) {
        msgs.push(votes[i].severity + votes[i].frequency);

        if (votes[i].userId === userId) {
          $(`.r${votes[i].severity} .c${votes[i].frequency}`).addClass(
            "selected"
          );
        }
      }
      msgs = msgs.sort();
      $("#results h3").text(msgs.join(", "));
    }
  });
});
