function sendSelection(elem, severity, frequency) {
  var userId = window.userId;
  var roomId = window.roomId;

  var myVote = null;

  for (let i = 0; i < window.votes.length; i++) {
    if (window.votes[i].userId === userId) {
      myVote = window.votes[i];
    }
  }

  if (!myVote) {
    myVote = { severity, frequency, userId, roomId };
  } else if (severity === null && frequency === myVote.frequency) {
    myVote.frequency = null;
  } else if (severity === myVote.severity && frequency === null) {
    myVote.severity = null;
  } else {
    if (severity !== null) {
      myVote.severity = severity;
    }
    if (frequency !== null) {
      myVote.frequency = frequency;
    }
  }
  window.socket.emit("vote", myVote);
}

function clearSelections(severity, frequency) {
  if (confirm("Are you sure you want to clear everyone's votes?")) {
    var userId = window.userId;
    var roomId = window.roomId;
    window.socket.emit("clear", { userId, roomId });
  }
}

function copyResults() {
  if (!navigator.clipboard) {
    // Clipboard API not available
    return;
  }
  try {
    var text = "Frequency:\n";
    text = text + $("#results-frequency h3").text();
    text = text + "\nSeverity:\n";
    text = text + $("#results-severity h3").text();

    navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy!", err);
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
    $("#results-frequency h3").text("");
    $("#results-severity h3").text("");
    $(".selected").removeClass("selected");
    window.votes = votes;

    if (votes && votes.length > 0) {
      var freqs = [];
      var sevs = [];
      var userId = window.userId;
      for (let i = 0; i < votes.length; i++) {
        if (votes[i].severity !== null) {
          sevs.push(votes[i].severity);
        }
        if (votes[i].frequency !== null) {
          freqs.push(votes[i].frequency);
        }

        if (votes[i].userId === userId) {
          $(`.r${votes[i].severity} .c${votes[i].frequency}`).addClass(
            "selected"
          );

          $(`.S${votes[i].severity}`).addClass("selected");
          $(`.F${votes[i].frequency}`).addClass("selected");
        }
      }
      freqs = freqs.sort();
      sevs = sevs.sort();
      $("#results-frequency h3").text(freqs.join(", "));
      $("#results-severity h3").text(sevs.join(", "));
    }
  });
});
