// ジョブカンの出勤簿のページを開いた時に、労働時間から残業時間を自動で表示する
// Webページの中で"table jbc-table text-center jbc-table-bordered jbc-table-hover"というクラス名を持つ要素を取得し、tableとする
var table = $(".table.jbc-table.text-center.jbc-table-bordered.jbc-table-hover");
// タイトルから年を取得する
var year = parseInt($(".card-title.row").find("div").text().match(/\d{4}年/)[0].replace("年", ""));
// テーブルの中で、労働時間、残業時間、日付、休日区分のインデックスを取得する
var workTimeIndex = table.find("th:contains('労働時間')").index();
var overTimeIndex = table.find("th:contains('残業時間')").index();
var dateIndex = table.find("th:contains('日付')").index();
var holidayTypeIndex = table.find("th:contains('休日区分')").index();
// 総残業時間を0で初期化する
var totalOverTimeMinutes = 0;
// 所定労働時間を8時間とする
var standardWorkTimeMinutes = 8 * 60;
// 今日の日付を取得する
var today = new Date();

// ヘッダー及びフッターを除く表の中で、workTimeIndexのインデックスのセルに値が入っている要素に対して、処理を行う
// この処理は、残業時間を計算して、残業時間のセルに表示する
// 残業時間の計算方法は、労働時間 - 8時間である
// セルにはhh:mmという形式で労働時間が入っているので、hhとmmに分けて、残業時間を計算する
// 労働時間のセルに値が入っていなかったら、スキップする
table.find("tbody tr").each(function() {
    var workTime = $(this).find("td").eq(workTimeIndex).text();
    var holidayType = $(this).find("td").eq(holidayTypeIndex).text();

    var date = $(this).find("td").eq(dateIndex).text();
    var month = parseInt(date.split("/")[0]);
    var day = parseInt(date.split("/")[1]);
    var thisDate = new Date(year, month - 1, day);
    var isFuture = thisDate > today;

    if (workTime) {
        // hh:mmという形式で労働時間が入っているので、hhとmmに分ける
        var workTimeArray = workTime.split(":");
        var hour = parseInt(workTimeArray[0]);
        var minute = parseInt(workTimeArray[1]);
        // hh:mmを分に変換する
        var workTimeMinute = hour * 60 + minute;
        // 残業時間を分で計算する。休日に障害等で出勤した場合はそのまま残業時間として計上する
        var overTimeMinutes = holidayType ? workTimeMinute : workTimeMinute - standardWorkTimeMinutes;
        // 総残業時間に残業時間を加算する
        totalOverTimeMinutes += overTimeMinutes;
        // 残業時間をhh:mmという形式に変換する。この時、残業時間がマイナスの場合は、-hh:mmという形式に変換する
        var overTime = (overTimeMinutes < 0 ? "-" : "") + ("0" + Math.floor(Math.abs(overTimeMinutes) / 60)).slice(-2) + ":" + ("0" + Math.abs(overTimeMinutes) % 60).slice(-2);
        // 残業時間をセルに表示する。残業時間がマイナスの場合は、文字色を赤にする
        $(this).find("td").eq(overTimeIndex).text(overTime).css("color", overTimeMinutes < 0 ? "red" : "");
    } else if (!holidayType && !isFuture){
        // 労働時間のセルに値が入っておらず、休日区分が空の場合は、総残業時間から所定労働時間を引く
        totalOverTimeMinutes -= standardWorkTimeMinutes;
        // 労働時間セルに00:00と表示する
        $(this).find("td").eq(workTimeIndex).text("00:00");
        // 残業時間セルに-08:00と表示する
        $(this).find("td").eq(overTimeIndex).text("-08:00").css("color", "red");
    }
});
// テーブルのフッターを取得する
var tableFooter = table.find("tfoot tr");
// 総残業時間をhh:mmという形式に変換する。この時、残業時間がマイナスの場合は、-hh:mmという形式に変換する
var totalOverTime = (totalOverTimeMinutes < 0 ? "-" : "") + ("0" + Math.floor(Math.abs(totalOverTimeMinutes) / 60)).slice(-2) + ":" + ("0" + Math.abs(totalOverTimeMinutes) % 60).slice(-2);
// フッターの5番目のtd要素に総残業時間を表示する。この時、残業時間がマイナスの場合は、文字色を赤にする
tableFooter.find("td").eq(4).text(totalOverTime).css("color", totalOverTimeMinutes < 0 ? "red" : "");
