# 02 — Bug injection

這是唯一刻意失敗的回復點：只要曾借過設備，就永遠拒絕再借。`node --test tests/scenario.test.js` 應因「歸還後再借」而失敗；不要把此 snapshot 當成最終版本。
