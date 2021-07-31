$(function(event) {
    $('#sear').on('click', function(event){
        let date = $('#date').val().replace('-','').replace('-','');
        $.ajax({
            async : true,     // 비동기방식인지 동기방식인지 설정
                              // 동기와 비동기의 차이.
                              // 커피전문점에서 커피시키는것과 비교해서 이해.
            url : 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json',
            type : 'GET',    // request 방식
            timeout : 3000, // 1000분의 1초 단위로 기다리는 시간을 표시
            data : {        // 서버쪽 프로그램에게 전달할 데이터를 명시(key, targetDt)
                key : 'd72d8b6a027e69315afb7687f19c1aaa',
                targetDt : date
            },
            dataType : 'json',   // 문자열인 JSON을 JavaScript객체로 변환
            success : function(result) {
                $('tbody').empty()
                x = result.boxOfficeResult.dailyBoxOfficeList;

                for(i=0; i<10; i++) {
                    let tr = $('<tr></tr>');  // table row

                    let rank = $('<td></td>').text(x[i].rank)   // table data

                    let poster = $('<td></td>')                 // poster img
                    $.ajax({
                        type : 'GET',
                        url : "https://dapi.kakao.com/v2/search/image",
                        headers : {
                            'Authorization': "KakaoAK 1225a1a55e1118fb28976759931121e3"
                        },
                        data : {'query' : x[i].movieNm,
                            'sort' : "",
                            'page' : 1,
                            'size' : 1
                        },
                        success : function(image) {
                            img_url = image.documents[0].image_url;
                            poster.append('<img src="'+img_url+'"/>')
                        }
                    })


                    let title = $('<td></td>').text(x[i].movieNm)
                    let openDate = $('<td></td>').text(x[i].openDt)


                    let info = $('<td></td>')                            //  Info
                    let info_btn = $('<button></button>').text('Info')
                    info_btn.addClass('btn btn-info')
                    let movie_code = x[i].movieCd
                    info_btn.on('click', function() {
                        $.ajax({
                            async : true,
                            url : 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json',
                            type : 'GET',
                            timeout : 3000,
                            data : {
                                key : 'd72d8b6a027e69315afb7687f19c1aaa',
                                movieCd : movie_code
                            },
                            dataType : 'json',
                            success : function(detail) {
                                y = detail.movieInfoResult.movieInfo;
                                let msg = ""

                                    msg += '영화제목 : ' + y.movieNm + "\r\n";  // 영화 제목
                                    msg += '제작연도 : ' + y.prdtYear + "\r\n";  // 제작연도
                                    msg += '개봉연도 : ' + y.openDt + "\r\n";    // 개봉연도
                                    msg += '제작국가 : ' + y.nations[0].nationNm + "\r\n"; // 제작국가
                                    msg += '감독이름 : ' + y.directors[0].peopleNm + "\r\n"; // 감독이름
                                    msg +=  '대표배우#1 : ' + y.actors[0].peopleNm + "\r\n";
                                    msg +=  '대표배우#2 : ' + y.actors[1].peopleNm + "\r\n";
                                    msg +=  '대표배우#3 : ' + y.actors[2].peopleNm + "\r\n";

                                   alert(msg)
                        },
                        error : function() {
                                alert('fail')
                        }
                        })
                    })
                    info.append(info_btn)


                    let del = $('<td></td>')    //   Delete
                    let del_btn = $('<button></button>').text('Delete')
                    del_btn.addClass('btn btn-danger')
                    del_btn.on('click', function() {
                        $(this).closest('tr').remove();
                    })
                    del.append(del_btn)

                    tr.append(rank)   //  append table data to table row
                    tr.append(poster)
                    tr.append(title)
                    tr.append(openDate)
                    tr.append(info)
                    tr.append(del)

                    $('tbody').append(tr)   //  append table row to tbody
                }
            },
            error : function() {
                alert('실패했어요!')
            }
        });
    })

})