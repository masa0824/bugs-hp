$(function(){
  // 回答送信[ログインモード]
  $('#answer3').on('click', function(){
    let msg;
    // クイズユーザーID取得
    const questUserId = $('#bugsquestQuestUserID').text();
    //console.log('questUserId:'+questUserId);

    // クイズID取得
    const questionId = $('#QuestionId').text();  
    //console.log('questionId:'+questionId);

    // クイズID取得
    const monsterId = $('#monsterId').text();  
    //console.log('monsterId:'+monsterId);
    
    // クイズ回答取得
    const answer = $('input:radio[name^="amswer"]:checked').val();
    const mode = $('#bugsquestMode').text();
    //console.log('mode:'+mode);
    
    if(answer === undefined){
      // バルーンメッセージ表示
      showBalloonMsg2();
      return false;

    }else{
      // 解答の正否チェック
      let quiz_result = checkAnswer({quest_recent_quiz_id : questionId, quest_quiz_answer : answer});
      
      if(quiz_result === 'true'){
        // ★解答正解

        // ウインドウ表示切り替え(バトル終了:勝利)
        setTimeout(() => {
          msgbox_battle_end_win(mode);
        }, 500);

        // 敵画像を非表示
        fadeProc('.enemy', 200, 'Out');

        //const token = $('meta[name="csrf-questuser-token"]').attr('content');
        //console.log(token);
      
        // APIにてバトル勝利処理とデータ取得
        const jsonData = JSON.parse(get_battle_victory_info({ quest_user_id: quest_user_id, mode: mode }));

        //Object.keys(jsonData.msg).forEach(function (key, value) {
        //  console.log([key, value]);
        //});

        // バトル終了メッセージを取得
        msg = ['モンスターをやっつけた！'];
        $.each(jsonData.msg, function(idx, obj) {
            if(obj != null){
              msg.push(obj);
            }
        });

        battle_msg({tid : 'span#typed',tclass : '.typed', strings : msg, startDelay : 1000});

        // 次回バトル案内
        if(mode === 'story'){
          $('.msgbox_in.question').text('次のバトルに挑戦しますか？');
        }else if (mode === 'select'){
          $('.msgbox_in.question').text('ストーリーに戻りますか？');
        }

      }else{
        // ★解答不正解
        damege_point = get_battle_damege({quest_user_id: quest_user_id, quest_monster_id : monsterId})

        if(!msgbox_battle_damege(damege_point)){
          // バトル終了メッセージ表示[敗北]
          setTimeout(() => {
            $('.msgbox_in.question').text('もう一度、挑戦しますか？');
            msgbox_battle_end_lose(mode);
            msg = ['勇者は全滅した・・・'];
            battle_msg({tid : 'span#typed',tclass : '.typed', strings : msg, startDelay : 1000});
          }, 3500);
        }
      }
    }
  });

  // 回答送信[ゲストモード]
  $('#answer2').on('click', function(){
    let msg;
    const answer = $('input:radio[name^="amswer"]:checked').val();
    if(answer === undefined){
      // バルーンメッセージ表示
      showBalloonMsg2();
      return false;

    }else if(answer === '1'){
      $('.msgbox_in.question').text('次のバトルに挑戦しますか？');
      
      // 敵画像を非表示
      fadeProc('.enemy', 200, 'Out');

      // ウインドウ表示切り替え(バトル終了)
      setTimeout(() => {
        msgbox_battle_end_guest();
      }, 500);

      msg = ['モンスターをやっつけた！'];
      msg.push('経験値0ポイントを獲得！');
      msg.push('アカウント登録して経験値をためよう！');
      battle_msg({tid : 'span#typed',tclass : '.typed', strings : msg, startDelay : 1000});

    }else if(answer === '0'){
      $('.msgbox_in.question').text('もう一度、挑戦しますか？');
      // ウインドウ表示切り替え(バトル終了)
      setTimeout(() => {
        msgbox_battle_end_guest();
      }, 500);

      msg = ['勇者は全滅した・・・'];
      battle_msg({tid : 'span#typed',tclass : '.typed', strings : msg, startDelay : 1000});
    }
  });

  // バトル選択用の値取得
  quest_user_id = $('#bugsquestQuestUserID').text();
  change_token = get_csrftoken_questuser();
  url_getStage = '/api/getStage?user_id='+quest_user_id+'&change_token='+change_token;
  //console.log(url_getStage);

  // ステージ・ステップ選択のチェック
  $('#select_battle').on('click', function(){
      let stage = $('#select_stage').val();
      //console.log('stage:'+stage);

      if(stage === '0' || stage === null){
          //console.log('err:1');
          return false;
      }

      let step = $('#select_step').val();
      //console.log('step:'+step);
      
      if(step === '0' || step === null){
          //console.log('err:2');
          return false;
      }
  });
  
  $.getJSON(url_getStage, function(json){
      // selectタグを生成してinsertに追加
  var insert_stage = $('<select>').attr('id', 'select_stage').attr('name', 'select_stage');
      var insert_step = $('<select>').attr('id', 'select_step').attr('name', 'select_step');
  var newLi_stage = $('<option>').val(0).text('選択して下さい');
      var newLi_step = $('<option>').val(0).text('stageを選択して下さい');

      // 初期のプルダウン項目をセット
  insert_stage.append(newLi_stage);
      insert_step.append(newLi_step);

  for(var i = 0; i < json.length; i++) {
          // optionタグを生成してテキスト追加
          newLi = $('<option>').val(json[i].num).text(json[i].num + ':' + json[i].name);
          // insert_stageに生成したliタグを追加
          insert_stage.append(newLi);
  }
  
  // 取得結果を追加
  $('#form_select_stage').append(insert_stage);
      $('#form_select_step').append(insert_step);
  });

  $('#form_select_stage').change(function(){
      const stage = $('#select_stage').val();
      // プルダウンの初期化
      $('select#select_step option').remove();
      
      if(stage === 0){
          var insert_step = $('<select>').attr('id', 'select_step');
          var newLi_step = $('<option>').val(0).text('stageを選択して下さい');
          insert_step.append(newLi_step);
      }else{
          url_getStep = '/api/getStep?user_id='+quest_user_id+'&change_token='+change_token+'&stage='+stage;
          //console.log(url_getStep);
          //$.getJSON('/api/getStep?stage=' + stage, function(json){
          $.getJSON(url_getStep, function(json){
              
              // selectタグを生成してinsertに追加
              var insert_step = $('#select_step');
              var newLi_step = $('<option>').val(0).text('stepを選択して下さい');
              
              insert_step.append(newLi_step);
              
              for(var i = 0; i < json.length; i++) {
                  // optionタグを生成してテキスト追加
                  newLi = $("<option>").val(json[i].id).text(json[i].id+':'+truncateText(json[i].question, 8));
                  // insert_stageに生成したliタグを追加
                  insert_step.append(newLi);
              }
          });
      }
      // 取得結果を追加
      $('#form_select_step').append(insert_step);
  });
});

///
/// フェード処理
/// 
fadeProc = (selector, time, InOut) => {
  switch (InOut) {
    case 'In':
      $(selector).delay(time).fadeIn();
      break;
    case 'Out':
      $(selector).delay(time).fadeOut();
      break;
  }
}

// モンスター出現メッセージ
encount_monstar_msg = () => {
  $('span#typed').text('');
  let monsterName = $('#monster_name').text();
  let typed = new Typed('.typed', {
    strings: [
      '「' + monsterName + '」が現れた！'
    ],
    typeSpeed: 10,
    //backSpeed: 20,
    startDelay: 400,
    loop: false,
    cursorChar: '',
  });
}

// ウインドウ表示切り替え1(バトル開始1)
msgbox_battle_start1 = () => {
  fadeProc('.menu_bar', 0, 'Out');
  fadeProc('.msgbox_out' + '.status1', 0, 'Out');
  fadeProc('.msgbox_out' + '.status2', 0, 'Out');
  fadeProc('.msgbox_out' + '.monster', 0, 'Out');
  fadeProc('.msgbox_out' + '.quiz', 0, 'Out');
  fadeProc('.msgbox_out' + '.question', 0, 'Out');
  fadeProc('.msgbox_out' + '.yesno', 0, 'Out');
  fadeProc('.msgbox_out' + '.yesno2', 0, 'Out');
  fadeProc('.msgbox2', 0, 'Out');
}

// ウインドウ表示切り替え2(バトル開始2)
msgbox_battle_start2 = () => {
  fadeProc('.menu_bar', 2000, 'In');
  fadeProc('.msgbox_out' + '.main', 2000, 'Out');
  fadeProc('.msgbox_out' + '.status1', 2100, 'In');
  fadeProc('.msgbox_out' + '.status2', 2100, 'In');
  fadeProc('.msgbox_out' + '.monster', 2100, 'In');
  fadeProc('.msgbox_out' + '.quiz', 2100, 'In');
  fadeProc('.msgbox2', 2100, 'In');
}

// バトルメッセージ
battle_msg = ({ tclass = [''],
                tid = [''],
                strings = [''],
                typeSpeed = 20,
                startDelay = 400,
                backSpeed = 0,
                backDelay = 1200,
                loop = false,
                cursorChar = '',
                contentType = ''}) => {
  $(tid).text('');
  let typed = new Typed(tclass, {
    strings: strings,
    typeSpeed: typeSpeed,
    startDelay: startDelay,
    backSpeed: backSpeed,
    backDelay: backDelay,
    loop: loop,
    cursorChar: cursorChar,
    //contentType: 'html',
  });
}

// バルーンメッセージの表示
showBalloonMsg2 = (msg) => {
  let wObjballoon = $('#makeImg');
  wObjballoon.text(msg);
  wObjballoon.removeClass('balloon1').addClass('balloon');
  setTimeout(function(){wObjballoon.removeClass('balloon').addClass('balloon1')}, 3000);
}

// 画面ロック
screenLock = () => {
  // ロック用のdivを生成
  var element = document.createElement('div'); 
  element.id = "screenLock"; 
  // ロック用のスタイル
  element.style.height = '100%'; 
  element.style.left = '0px'; 
  element.style.position = 'fixed';
  element.style.top = '0px';
  element.style.width = '100%';
  element.style.zIndex = '9999';
  element.style.opacity = '0';

  var objBody = document.getElementsByTagName("body").item(0); 
  objBody.appendChild(element);
}

// ウインドウ表示切り替え(不正解：ダメージ)
msgbox_battle_damege = (damege_point) => {
  fadeProc('.msgbox_out' + '.quiz', 0, 'Out');
  fadeProc('.msgbox_out' + '.monster', 0, 'Out');
  fadeProc('.msgbox2', 0, 'Out');
  fadeProc('.msgbox_out' + '.main', 300, 'In');

  //　ユーザーHP取得
  userHp = $('span#user_hp').text();

  // メッセージ表示
  msg = ['勇者は' + damege_point + 'ポイントのダメージを受けた'];
  battle_msg({tid : 'span#typed',tclass : '.typed', strings : msg, startDelay : 1000});
  
  // 現在のHP
  recent_hp = Math.max(0, userHp - damege_point);
  setTimeout(() => {
    $('span#user_hp').text(recent_hp);
  }, 2500);
  
  if(recent_hp === 0){
    return false;
  }else{
    setTimeout(() => {
      fadeProc('.msgbox_out' + '.quiz', 500, 'In');
      fadeProc('.msgbox_out' + '.monster', 500, 'In');
      fadeProc('.msgbox2', 500, 'In');
      fadeProc('.msgbox_out' + '.main', 800, 'Out');
    }, 2500);
    return true;
  }
}

// ウインドウ表示切り替え(バトル終了:勝利)
msgbox_battle_end_win = (mode) => {
  fadeProc('.msgbox_out' + '.main', 300, 'In');
  //fadeProc('.msgbox_out' + '.status', 0, 'Out');
  fadeProc('.msgbox_out' + '.monster', 0, 'Out');
  fadeProc('.msgbox_out' + '.quiz', 0, 'Out');
  fadeProc('.msgbox2', 0, 'Out');
  //fadeProc('.menu_bar', 0, 'Out');
  fadeProc('.msgbox_out' + '.question', 3500, 'In');
  if(mode === 'story'){
    fadeProc('.msgbox_out' + '.yesno', 4000, 'In');
  }else if (mode === 'select'){
    fadeProc('.msgbox_out' + '.yesno', 4000, 'In');
  }
}

// ウインドウ表示切り替え(バトル終了:敗北)
msgbox_battle_end_lose = (mode) => {
  fadeProc('.msgbox_out' + '.main', 300, 'In');
  //fadeProc('.msgbox_out' + '.status', 0, 'Out');
  fadeProc('.msgbox_out' + '.monster', 0, 'Out');
  fadeProc('.msgbox_out' + '.quiz', 0, 'Out');
  fadeProc('.msgbox2', 0, 'Out');
  //fadeProc('.menu_bar', 0, 'Out');
  fadeProc('.msgbox_out' + '.question', 3500, 'In');
  if(mode === 'story'){
    fadeProc('.msgbox_out' + '.yesno', 4000, 'In');
  }else if (mode === 'select'){
    fadeProc('.msgbox_out' + '.yesno2', 4000, 'In');
  }
}

// ウインドウ表示切り替え(バトル終了:ゲスト)
msgbox_battle_end_guest = () => {
  fadeProc('.msgbox_out' + '.main', 300, 'In');
  //fadeProc('.msgbox_out' + '.status', 0, 'Out');
  fadeProc('.msgbox_out' + '.monster', 0, 'Out');
  fadeProc('.msgbox_out' + '.quiz', 0, 'Out');
  fadeProc('.msgbox2', 0, 'Out');
  fadeProc('.menu_bar', 0, 'Out');
  fadeProc('.msgbox_out' + '.question', 3500, 'In');
  fadeProc('.msgbox_out' + '.yesno', 4000, 'In');
}

// 文字を丸める
truncateText = (str, len) => {
  return str.length <= len ? str : str.substr(0, len) + '...';
}