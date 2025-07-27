# フロントエンド処理MEMO

## 削除処理の流れ

```
1. ユーザーが削除ボタンをクリック
   ↓
2. CharacterList.handleCharacterDelete()が呼ばれる
   ↓
3. onCharacterDelete(characterId)を呼び出し（親に委譲）
   ↓
4. GroupDetail.onCharacterDeleteが実行される
   ↓
5. GroupDetail.handleDeleteCharacter()が呼ばれる
   ↓
6. ConfirmDialogが表示される
   ↓
7. ユーザーが確認すると handleConfirmDeleteCharacter()が実行
   ↓
8. 実際の削除処理（deleteCharacter）が実行される
```

GroupDetailに定義したhandleDeleteCharacter()を子コンポーネントに渡して実行している。