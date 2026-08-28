# -*- coding: utf-8 -*-
"""
誰能把禮物送進老師ㄉ心裡 —— 教師節限定商品模擬市場
國立員林家商 商貿科（商業經營科・國際貿易科）

資料來源：
  1. 有設定 st.secrets["gcp_service_account"] → 讀寫 Google 試算表
  2. 沒有設定 → 讀寫 data/ 底下的 CSV（本機測試用）
"""
import datetime as dt
import random
import time
from pathlib import Path

import pandas as pd
import streamlit as st

# ─────────────── 可調整的參數 ───────────────
COIN = "✨"                 # 商貿幣符號
BASE_CREDIT = 250          # 每位老師基本額度
CREDIT_PER_CLASS = 50      # 每任教一個參賽班級加給
PRICE_MIN, PRICE_MAX = 50, 200
TITLE = "誰能把禮物送進老師ㄉ心裡"
SUBTITLE = "115學年度 教師節限定商品模擬市場｜國立員林家商 商貿科"

DATA_DIR = Path(__file__).parent / "data"
SHEETS = {"products": "商品", "teachers": "老師", "orders": "訂單", "settings": "設定",
          "signups": "報名"}
ORDER_COLS = ["時間", "老師", "商品ID", "售價"]
TEACHER_COLS = ["姓名", "通行碼", "任教參賽班數", "自訂額度", "備註"]
REVIEW_COLS = ["審查", "退件原因"]
PRODUCT_COLS = ["商品ID", "班級", "商品名稱", "售價", "單位成本", "商品介紹", "示意圖"]

st.set_page_config(page_title=TITLE, page_icon=COIN, layout="wide")

# ─────────────── 樣式 ───────────────
st.markdown("""
<style>
html, body, [class*="css"], .stApp { font-family:'jf-openhuninn','Microsoft JhengHei','PingFang TC',sans-serif; }
.stApp { background: linear-gradient(180deg,#FFFCF5 0%,#FAF5E9 45%,#F1E9D6 100%); }
h1,h2,h3 { color:#4A3B22 !important; letter-spacing:1px; }
.badge { display:inline-block;padding:6px 16px;border-radius:99px;background:#DCE7C9;
         color:#4E6B3B;font-weight:700;font-size:15px;margin-right:6px }
.badge.pink { background:#EFDDE6;color:#8E5872 }
.badge.gold { background:#F3E5C4;color:#8A6A1E }
.card { background:#FFFCF5;border:4px solid #DCE7C9;border-radius:24px;padding:14px 16px 6px;
        margin-bottom:14px }
.card h4 { margin:6px 0 2px;color:#4A3B22;font-size:20px }
.card .cls { color:#8A6A1E;font-size:14px;font-weight:700 }
.card .desc { color:#6E5A3A;font-size:15px;line-height:1.5;min-height:66px }
.card .price { color:#4E6B3B;font-size:26px;font-weight:800;margin:4px 0 8px }
.wallet { background:#FFFCF5;border:4px solid #EFDDE6;border-radius:24px;padding:16px 18px;text-align:center }
.wallet .n { font-size:40px;font-weight:800;color:#4A3B22;line-height:1.2 }
.wallet .t { font-size:14px;color:#6E5A3A }
div[data-testid="stButton"] { width:100% }
div[data-testid="stButton"] > button { border-radius:99px;border:0;background:#7E9B60;color:#fff;
    font-weight:700;padding:10px 18px;min-height:46px;width:100% !important; }
div[data-testid="stButton"] > button:hover { background:#4E6B3B;color:#fff }
div[data-testid="stButton"] > button:disabled { background:#E3E0D5;color:#9A9284 }
section[data-testid="stSidebar"] { background:#FBF7EC }
</style>
""", unsafe_allow_html=True)


# ═══════════════ 資料層 ═══════════════
def secret(key, default=None):
    """沒有 secrets.toml 時不要拋錯。"""
    try:
        return st.secrets[key]
    except Exception:
        return default


def use_gsheet() -> bool:
    return secret("gcp_service_account") is not None


@st.cache_resource(show_spinner=False)
def _open_sheet():
    import gspread
    gc = gspread.service_account_from_dict(dict(secret("gcp_service_account")))
    return gc.open_by_url(secret("sheet_url"))


def with_retry(fn, tries: int = 4):
    """遇到 429（配額用完）就等一下再試，避免整頁壞掉。"""
    for i in range(tries):
        try:
            return fn()
        except Exception as e:
            code = getattr(getattr(e, "response", None), "status_code", None)
            if code not in (429, 500, 503) and "429" not in str(e):
                raise
            if i == tries - 1:
                raise
            time.sleep((2 ** i) + random.random())


def _read(name: str) -> pd.DataFrame:
    if use_gsheet():
        ws = with_retry(lambda: _open_sheet().worksheet(SHEETS[name]))
        df = pd.DataFrame(with_retry(ws.get_all_records))
    else:
        f = DATA_DIR / f"{SHEETS[name]}.csv"
        df = pd.read_csv(f, dtype=str) if f.exists() else pd.DataFrame()
    return df.fillna("")


@st.cache_data(ttl=120, show_spinner=False)
def read_products() -> pd.DataFrame:
    """型錄 = 審查通過的報名 + 「商品」分頁手動加的（兩邊都可能是空的）。"""
    try:
        df = _read("products")
    except Exception:
        df = pd.DataFrame()          # 沒有「商品」分頁也沒關係
    if df.empty or "商品ID" not in df:
        df = pd.DataFrame(columns=PRODUCT_COLS)
    else:
        df["售價"] = pd.to_numeric(df["售價"], errors="coerce").fillna(0).astype(int)
        if "單位成本" in df:
            df["單位成本"] = pd.to_numeric(df["單位成本"], errors="coerce").fillna(0.0)
        df["商品ID"] = df["商品ID"].astype(str)
        if "上架" in df:
            df = df[df["上架"].astype(str).str.strip()
                    .isin(["是", "Y", "y", "TRUE", "True", "1"])]
        df = df.reset_index(drop=True)

    auto = signups_to_products(read_signups())
    if not auto.empty:
        df = pd.concat([auto, df], ignore_index=True)
    if df.empty:
        return df
    return df.drop_duplicates(subset=["商品ID"], keep="first").reset_index(drop=True)


@st.cache_data(ttl=90, show_spinner=False)
def read_signups() -> pd.DataFrame:
    """學生線上報名表送進來的資料（由 Apps Script 寫入）。"""
    try:
        df = _read("signups")
    except Exception:
        return pd.DataFrame()
    if df.empty or "班級" not in df:
        return pd.DataFrame()
    for c in REVIEW_COLS:
        if c not in df:
            df[c] = ""
    df["班級"] = df["班級"].astype(str).str.strip()
    df = df[df["班級"] != ""]
    df["售價"] = pd.to_numeric(df.get("售價", 0), errors="coerce").fillna(0).astype(int)
    df["單位總成本"] = pd.to_numeric(df.get("單位總成本", 0), errors="coerce").fillna(0.0)
    df["審查"] = df["審查"].astype(str).str.strip()
    return df.reset_index(drop=True)


def signups_to_products(sg: pd.DataFrame) -> pd.DataFrame:
    """審查通過的報名，轉成型錄用的商品。"""
    if sg.empty:
        return pd.DataFrame()
    ok = sg[sg["審查"] == "通過"]
    if ok.empty:
        return pd.DataFrame()
    return pd.DataFrame({
        "商品ID": ok["班級"],
        "班級": ok["班級"],
        "商品名稱": ok.get("商品名稱", ""),
        "售價": ok["售價"],
        "單位成本": ok["單位總成本"],
        "商品介紹": ok.get("商品介紹", ""),
        "示意圖": ok.get("示意圖連結", ""),
    }).reset_index(drop=True)


def write_review(edited: pd.DataFrame) -> None:
    """只回寫「審查」與「退件原因」兩欄，不動學生填的內容。"""
    if use_gsheet():
        ws = _open_sheet().worksheet(SHEETS["signups"])
        values = ws.get_all_values()
        if not values:
            return
        head = values[0]
        for c in REVIEW_COLS:
            if c not in head:
                head.append(c)
                ws.update_cell(1, len(head), c)
        ci = {c: head.index(c) for c in ["班級"] + REVIEW_COLS}
        cells = []
        for r in range(1, len(values)):
            row = values[r] + [""] * (len(head) - len(values[r]))
            hit = edited[edited["班級"].astype(str) == str(row[ci["班級"]]).strip()]
            if hit.empty:
                continue
            for c in REVIEW_COLS:
                cells.append(gspread_cell(r + 1, ci[c] + 1, str(hit.iloc[0][c])))
        if cells:
            ws.update_cells(cells)
    else:
        f = DATA_DIR / f"{SHEETS['signups']}.csv"
        df = _read("signups")
        for c in REVIEW_COLS:
            if c not in df:
                df[c] = ""
        for _, e in edited.iterrows():
            m = df["班級"].astype(str).str.strip() == str(e["班級"]).strip()
            for c in REVIEW_COLS:
                df.loc[m, c] = e[c]
        df.to_csv(f, index=False)
    st.cache_data.clear()


def gspread_cell(row, col, value):
    import gspread
    return gspread.Cell(row, col, value)


@st.cache_data(ttl=120, show_spinner=False)
def read_teachers() -> pd.DataFrame:
    df = _read("teachers")
    if df.empty:
        return df
    for c in TEACHER_COLS:
        if c not in df:
            df[c] = ""
    df["任教參賽班數"] = pd.to_numeric(df["任教參賽班數"], errors="coerce").fillna(0).astype(int)
    custom = pd.to_numeric(df["自訂額度"], errors="coerce").fillna(0).astype(int)
    formula = BASE_CREDIT + CREDIT_PER_CLASS * df["任教參賽班數"]
    # 自訂額度有填（大於 0）就以自訂額度為準，否則用公式算
    df["額度"] = [c if c > 0 else f for c, f in zip(custom, formula)]
    df["自訂額度"] = custom
    df["通行碼"] = df["通行碼"].astype(str).str.strip()
    df["姓名"] = df["姓名"].astype(str).str.strip()
    return df[df["姓名"] != ""].reset_index(drop=True)


def write_teachers(df: pd.DataFrame) -> None:
    out = df.copy()
    for c in TEACHER_COLS:
        if c not in out:
            out[c] = ""
    out = out[TEACHER_COLS].fillna("")
    out["姓名"] = out["姓名"].astype(str).str.strip()
    out["通行碼"] = out["通行碼"].astype(str).str.strip().str.removesuffix(".0")
    out = out[out["姓名"] != ""]
    out["任教參賽班數"] = pd.to_numeric(out["任教參賽班數"], errors="coerce").fillna(0).astype(int)
    out["自訂額度"] = pd.to_numeric(out["自訂額度"], errors="coerce").fillna(0).astype(int)
    out["自訂額度"] = out["自訂額度"].replace(0, "")
    if use_gsheet():
        ws = _open_sheet().worksheet(SHEETS["teachers"])
        ws.clear()
        ws.update([TEACHER_COLS] + out.astype(str).values.tolist())
    else:
        DATA_DIR.mkdir(exist_ok=True)
        out.to_csv(DATA_DIR / f"{SHEETS['teachers']}.csv", index=False)
    st.cache_data.clear()


@st.cache_data(ttl=20, show_spinner=False)
def read_orders() -> pd.DataFrame:
    df = _read("orders")
    if df.empty:
        return pd.DataFrame(columns=ORDER_COLS)
    df["售價"] = pd.to_numeric(df["售價"], errors="coerce").fillna(0).astype(int)
    df["商品ID"] = df["商品ID"].astype(str)
    return df


@st.cache_data(ttl=60, show_spinner=False)
def read_settings() -> dict:
    df = _read("settings")
    if df.empty or "項目" not in df:
        return {}
    return {str(r["項目"]).strip(): str(r["設定值"]).strip() for _, r in df.iterrows()}


def add_order(teacher: str, pid: str, price: int) -> None:
    row = [dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), teacher, str(pid), int(price)]
    if use_gsheet():
        with_retry(lambda: _open_sheet().worksheet(SHEETS["orders"])
                   .append_row(row, value_input_option="USER_ENTERED"))
        read_orders.clear()
        return
    else:
        DATA_DIR.mkdir(exist_ok=True)
        f = DATA_DIR / f"{SHEETS['orders']}.csv"
        df = read_orders()
        df.loc[len(df)] = row
        df.to_csv(f, index=False)
        read_orders.clear()


def cancel_order(teacher: str, pid: str) -> None:
    df = read_orders()
    keep = ~((df["老師"] == teacher) & (df["商品ID"] == str(pid)))
    df = df[keep]
    if use_gsheet():
        ws = with_retry(lambda: _open_sheet().worksheet(SHEETS["orders"]))
        with_retry(ws.clear)
        with_retry(lambda: ws.update([ORDER_COLS] + df[ORDER_COLS].astype(str).values.tolist()))
    else:
        df.to_csv(DATA_DIR / f"{SHEETS['orders']}.csv", index=False)
    read_orders.clear()


# ═══════════════ 共用元件 ═══════════════
LOGO = Path(__file__).parent / "assets" / "logo.png"


def header():
    if LOGO.exists():
        st.image(str(LOGO), width=340)
    st.markdown(f"# {COIN} {TITLE}")
    st.caption(SUBTITLE)


def is_open(cfg) -> bool:
    return cfg.get("開賣狀態", "開賣中") == "開賣中"


def login_box(teachers: pd.DataFrame):
    header()
    st.markdown("#### 老師，請先登入")
    st.write("選擇您的姓名，輸入商貿科發給您的 4 碼通行碼。")
    c1, c2 = st.columns([2, 1])
    name = c1.selectbox("姓名", ["請選擇"] + teachers["姓名"].tolist(), label_visibility="collapsed")
    code = c2.text_input("通行碼", max_chars=8, type="password",
                         placeholder="4 碼通行碼", label_visibility="collapsed")
    if st.columns([1, 3])[0].button("登入", type="primary", use_container_width=True):
        row = teachers[teachers["姓名"] == name]
        if row.empty:
            st.error("請先選擇姓名。")
        elif code.strip() != row.iloc[0]["通行碼"]:
            st.error("通行碼不正確，再確認一次紙條上的四碼。")
        else:
            st.session_state.user = name
            st.rerun()
    st.divider()
    st.caption(f"商貿幣（{COIN}）為本競賽之虛擬購買額度，不具現金價值，不得轉讓或兌現。")


def wallet(total: int, used: int):
    left = total - used
    c1, c2, c3 = st.columns(3)
    for col, n, t in [(c1, f"{COIN}{left}", "剩餘商貿幣"),
                      (c2, f"{COIN}{used}", "已下訂金額"),
                      (c3, f"{COIN}{total}", "您的總額度")]:
        col.markdown(f"<div class='wallet'><div class='n'>{n}</div><div class='t'>{t}</div></div>",
                     unsafe_allow_html=True)


def shop_tab(products, my_orders, left, opened):
    bought = set(my_orders["商品ID"])
    if not opened:
        st.warning("目前不在開賣期間，型錄僅供瀏覽。")
    cols = st.columns(3)
    for i, p in products.iterrows():
        pid, price = str(p["商品ID"]), int(p["售價"])
        with cols[i % 3]:
            if str(p.get("示意圖", "")).startswith("http"):
                st.image(p["示意圖"], use_container_width=True)
            st.markdown(
                f"<div class='card'><div class='cls'>{p.get('班級','')}</div>"
                f"<h4>{p['商品名稱']}</h4>"
                f"<div class='desc'>{p.get('商品介紹','')}</div>"
                f"<div class='price'>{COIN}{price}</div></div>", unsafe_allow_html=True)
            if pid in bought:
                if st.button("已下訂・點此取消", key=f"c{pid}", use_container_width=True):
                    cancel_order(st.session_state.user, pid)
                    st.rerun()
            elif not opened:
                st.button("尚未開賣", key=f"x{pid}", disabled=True, use_container_width=True)
            elif price > left:
                st.button(f"餘額不足（差 {COIN}{price-left}）", key=f"n{pid}", disabled=True, use_container_width=True)
            else:
                if st.button(f"用 {COIN}{price} 帶走", key=f"b{pid}", type="primary", use_container_width=True):
                    add_order(st.session_state.user, pid, price)
                    st.toast(f"已下訂：{p['商品名稱']}", icon="🎁")
                    st.rerun()


def orders_tab(products, my_orders):
    if my_orders.empty:
        st.info("您還沒有下訂任何商品。回到「商品型錄」逛一逛吧。")
        return
    m = my_orders.merge(products[["商品ID", "商品名稱", "班級"]], on="商品ID", how="left")
    st.dataframe(m[["時間", "班級", "商品名稱", "售價"]],
                 use_container_width=True, hide_index=True)
    st.markdown(f"**合計 {COIN}{int(m['售價'].sum())}**")


def admin_tab(products, teachers, orders, cfg):
    st.markdown("### 後台結算")
    if orders.empty:
        st.info("目前沒有任何訂單。")
        return
    g = orders.groupby("商品ID").agg(購買數量=("商品ID", "size"), 銷售額=("售價", "sum")).reset_index()
    r = products.merge(g, on="商品ID", how="left").fillna({"購買數量": 0, "銷售額": 0})
    r["購買數量"] = r["購買數量"].astype(int)
    r["銷售額"] = r["銷售額"].astype(int)
    r["銷貨成本"] = (r["單位成本"] * r["購買數量"]).round(2)
    r["毛利"] = (r["銷售額"] - r["銷貨成本"]).round(2)
    r["毛利率"] = [round(g / v * 100, 2) if v else 0.0 for g, v in zip(r["毛利"], r["銷售額"])]
    show = r[["班級", "商品名稱", "售價", "單位成本", "購買數量", "銷售額", "銷貨成本", "毛利", "毛利率"]]

    c1, c2, c3 = st.columns(3)
    for col, lab, key in [(c1, "🏆 人氣冠軍", "購買數量"), (c2, "🏆 銷售額冠軍", "銷售額"),
                          (c3, "🏆 毛利冠軍", "毛利")]:
        top = r.sort_values(key, ascending=False).iloc[0]
        col.markdown(f"**{lab}**<br><span class='badge gold'>{top['班級']} {top['商品名稱']}</span>"
                     f"<br>{key} {top[key]}", unsafe_allow_html=True)
    st.divider()
    st.dataframe(show.sort_values("銷售額", ascending=False),
                 use_container_width=True, hide_index=True)
    st.download_button("下載結算表 CSV", show.to_csv(index=False).encode("utf-8-sig"),
                       "教師節模擬市場_結算表.csv", "text/csv")
    st.divider()
    st.markdown("#### 老師投票情形")
    t = teachers[["姓名", "任教參賽班數", "額度"]].merge(
        used_by_teacher(orders), left_on="姓名", right_index=True, how="left").fillna({"已使用": 0})
    t["已使用"] = t["已使用"].astype(int)
    t["剩餘"] = t["額度"] - t["已使用"]
    over = t[t["剩餘"] < 0]
    if not over.empty:
        st.warning("下列老師的已使用金額超過目前額度（多半是額度被調低）："
                   + "、".join(over["姓名"].tolist()))
    st.dataframe(t, use_container_width=True, hide_index=True)


def used_by_teacher(orders: pd.DataFrame):
    if orders.empty:
        return pd.Series(dtype=int, name="已使用")
    return orders.groupby("老師")["售價"].sum().rename("已使用")


def review_tab():
    sg = read_signups()
    st.markdown("### 報名審查")
    if sg.empty:
        st.info("還沒有任何班級送出報名表。學生一按「送出報名表」，這裡就會出現。")
        return
    st.caption("「審查」改成 **通過**，該班商品立刻出現在型錄；改成 **退件** 並寫原因，"
               "學生補件重送後審查會自動清空，需要重新審一次。")
    done = (sg["審查"] == "通過").sum()
    st.markdown(f"<span class='badge'>已收件 {len(sg)} 班</span>"
                f"<span class='badge gold'>通過 {done}</span>"
                f"<span class='badge pink'>待審 {(~sg['審查'].isin(['通過', '退件'])).sum()}</span>",
                unsafe_allow_html=True)

    live = len(read_products())
    st.markdown(f"<span class='badge gold'>目前型錄上架 {live} 件</span>", unsafe_allow_html=True)
    if done and live == 0:
        st.error("審查通過但型錄沒有商品，請確認「報名」分頁的審查欄是「通過」兩個字。")

    view = sg[["班級", "商品名稱", "售價", "單位總成本", "審查", "退件原因"]].copy()
    view["毛利"] = (view["售價"] - view["單位總成本"]).round(2)
    view["低於成本"] = view["毛利"] < 0
    view["售價超範圍"] = (view["售價"] < PRICE_MIN) | (view["售價"] > PRICE_MAX)
    view["審查"] = view["審查"].replace("", "待審")
    view["退件原因"] = view["退件原因"].astype(str)
    view = view[["班級", "商品名稱", "售價", "單位總成本", "毛利",
                 "低於成本", "售價超範圍", "審查", "退件原因"]]
    edited = st.data_editor(
        view, use_container_width=True, hide_index=True, key="review_editor",
        disabled=["班級", "商品名稱", "售價", "單位總成本", "毛利", "低於成本", "售價超範圍"],
        column_config={
            "審查": st.column_config.SelectboxColumn("審查", options=["待審", "通過", "退件"], required=True),
            "退件原因": st.column_config.TextColumn("退件原因（學生看不到，請另行通知）"),
            "低於成本": st.column_config.CheckboxColumn("售價低於成本"),
            "售價超範圍": st.column_config.CheckboxColumn(f"售價不在 {PRICE_MIN}～{PRICE_MAX}"),
        })
    if st.columns([1, 3])[0].button("儲存審查結果", type="primary", use_container_width=True):
        out = edited.copy()
        out["審查"] = out["審查"].replace("待審", "")
        write_review(out)
        st.success("已儲存，通過的班級馬上會出現在型錄。")
        st.rerun()

    st.divider()
    st.markdown("#### 看某一班的完整報名表")
    pick = st.selectbox("選擇班級", sg["班級"].tolist())
    row = sg[sg["班級"] == pick].iloc[0]
    c1, c2 = st.columns([1, 2])
    with c1:
        if str(row.get("示意圖連結", "")).startswith("http"):
            st.image(row["示意圖連結"], use_container_width=True)
        else:
            st.caption("（沒有示意圖）")
    with c2:
        st.text(row.get("報名表全文", "（無）"))


def credit_tab(teachers: pd.DataFrame, orders: pd.DataFrame):
    st.markdown("### 老師與商貿幣額度設定")
    st.caption(f"預設額度 ＝ 基本 {COIN}{BASE_CREDIT} ＋ 任教參賽班數 × {COIN}{CREDIT_PER_CLASS}。"
               f"「自訂額度」有填數字時，就以自訂額度為準（0 或空白代表用公式算）。")
    used = used_by_teacher(orders)
    base = teachers[TEACHER_COLS].copy()
    base["自訂額度"] = pd.to_numeric(base["自訂額度"], errors="coerce").fillna(0).astype(int)
    edited = st.data_editor(
        base, num_rows="dynamic", use_container_width=True, hide_index=True,
        key="credit_editor",
        column_config={
            "姓名": st.column_config.TextColumn("姓名", required=True),
            "通行碼": st.column_config.TextColumn("通行碼", help="4 碼，避免 0000、1111"),
            "任教參賽班數": st.column_config.NumberColumn("任教參賽班數", min_value=0, max_value=20, step=1),
            "自訂額度": st.column_config.NumberColumn(f"自訂額度（{COIN}）", min_value=0, step=10,
                                                 format="%d", help="填 0 代表用公式算；填數字就以這個為準"),
            "備註": st.column_config.TextColumn("備註"),
        })
    c1, c2 = st.columns([1, 3])
    if c1.button("儲存額度設定", type="primary", use_container_width=True):
        write_teachers(edited)
        st.success("已儲存，老師端重新整理後即生效。")
        st.rerun()
    st.divider()
    st.markdown("#### 目前生效的額度")
    pv = teachers[["姓名", "任教參賽班數", "自訂額度", "額度"]].merge(
        used, left_on="姓名", right_index=True, how="left").fillna({"已使用": 0})
    pv["已使用"] = pv["已使用"].astype(int)
    pv["剩餘"] = pv["額度"] - pv["已使用"]
    pv["自訂額度"] = pv["自訂額度"].apply(lambda v: "—" if int(v) == 0 else str(int(v)))
    st.dataframe(pv, use_container_width=True, hide_index=True)
    st.download_button("下載老師名單 CSV", teachers[TEACHER_COLS + ["額度"]].to_csv(index=False).encode("utf-8-sig"),
                       "老師名單與額度.csv", "text/csv")


# ═══════════════ 主流程 ═══════════════
def main():
    teachers = read_teachers()
    if teachers.empty:
        st.error("找不到「老師」資料，請確認試算表或 data/老師.csv。")
        st.stop()
    cfg = read_settings()

    if "user" not in st.session_state:
        login_box(teachers)
        st.stop()

    user = st.session_state.user
    me = teachers[teachers["姓名"] == user].iloc[0]
    products = read_products()
    orders = read_orders()
    my_orders = orders[orders["老師"] == user]
    total, used = int(me["額度"]), int(my_orders["售價"].sum())

    with st.sidebar:
        st.markdown(f"### {user} 老師")
        st.markdown(f"<span class='badge'>剩餘 {COIN}{total-used}</span>"
                    f"<span class='badge pink'>額度 {COIN}{total}</span>", unsafe_allow_html=True)
        st.caption(f"基本 {COIN}{BASE_CREDIT}　+　任教 {me['任教參賽班數']} 個參賽班 × {COIN}{CREDIT_PER_CLASS}")
        st.divider()
        st.caption(f"・同一項商品至多購買一件\n\n・售價區間 {COIN}{PRICE_MIN}～{COIN}{PRICE_MAX}\n\n"
                   "・各組成本與毛利於投票截止後才公開")
        admin_pw = st.text_input("主辦單位登入", type="password", placeholder="管理密碼（老師不需輸入）")
        if st.button("登出", use_container_width=True):
            del st.session_state.user
            st.rerun()

    header()
    wallet(total, used)
    st.write("")

    is_admin = bool(admin_pw) and admin_pw == str(secret("admin_password", "bae2026"))
    tabs = st.tabs(["🛍️ 商品型錄", "🧾 我的訂單"]
                   + (["📋 報名審查", "🔐 後台結算", "✨ 額度設定"] if is_admin else []))
    with tabs[0]:
        if products.empty:
            st.info("商品尚未上架——各班報名經主辦單位審查通過後，就會出現在這裡。")
        else:
            shop_tab(products, my_orders, total - used, is_open(cfg))
    with tabs[1]:
        orders_tab(products, my_orders)
    if is_admin:
        with tabs[2]:
            review_tab()
        with tabs[3]:
            admin_tab(products, teachers, orders, cfg)
        with tabs[4]:
            credit_tab(teachers, orders)


main()
