
def detect_combination(df) :
    cols = df.columns.to_list()

    print("NORMALIZED COLS:", cols)

    # has_date = any(c in cols for c in ['date','month'])
    # has_category = any(c in cols for c in ['category'])
    # has_product = any(c in cols for c in ['product'])
    # has_price = any(c in cols for c in ['price'])
    # has_qty = any(c in cols for c in ['quantity'])
    # has_total = any(c in cols for c in ['total'])

    has_date = any(c in df.columns and df[c].notna().any() for c in ['date', 'month'])
    has_category = 'category' in df.columns and df['category'].notna().any()
    has_product = 'product' in df.columns and df['product'].notna().any()
    has_price = 'price' in df.columns and df['price'].notna().any()
    has_qty = 'quantity' in df.columns and df['quantity'].notna().any()
    has_total = 'total' in df.columns and df['total'].notna().any()

    print("FLAGS:", has_date, has_category, has_product, has_price, has_qty, has_total)

    # full dataset
    if has_date and has_category and has_product and has_total and has_qty:
        return {
            "combination" : "combo_1",
            "charts" : [
                "revenue_line_chart",
                "category_bar_chart",
                "category_pie_chart",
                "top_products_bar_chart",
            ],
            "kpis" : [
                "total_revenue",
                "total_orders",
                "total_units_sold",
                "avg_order_value",
                "top_product",
                "top_category",
                "best_month",
            ],
            "flags": {
                "has_date": has_date, "has_category": has_category,
                "has_product": has_product, "has_total": has_total,
                "has_qty": has_qty, "has_price": has_price,
            }
        }
    
    # time category total price
    elif has_date and has_category and has_total and has_price:
        return {
            "combination" : "combo_3",
            "charts" : [
                "revenue_line_chart",
                "top_products_bar_chart",
                "price_vs_qty_scatter",
            ],
            "kpis" : [
                "total_revenue",
                "total_units_sold",
                "top_product",
                "best_month",
            ] ,
            "flags": {
                "has_date": has_date, "has_category": has_category,
                "has_product": has_product, "has_total": has_total,
                "has_qty": has_qty, "has_price": has_price,
            }
        }


    # time category total
    elif has_date and has_category and has_total:
        return {
            "combination" : "combo_2",
            "charts" : [
                "revenue_line_chart",
                "category_bar_chart",
                "category_pie_chart",
                "stacked_bar_chart",
            ],
            "kpis" : [
                "total_revenue",
                "revenue_per_category",
                "top_category",
                "best_month",
            ],
            "flags": {
                "has_date": has_date, "has_category": has_category,
                "has_product": has_product, "has_total": has_total,
                "has_qty": has_qty, "has_price": has_price,
            }
        }    


    # product qty total
    elif has_product and has_total and has_qty:
        return {
            "combination" : "combo_4",
            "charts" : [
                "top_products_bar_chart",
                "product_qty_chart",
            ],
            "kpis" : [
                "total_revenue",
                "total_units_sold",
                "avg_order_value",
                "top_product",
            ],
            "flags": {
                "has_date": has_date, "has_category": has_category,
                "has_product": has_product, "has_total": has_total,
                "has_qty": has_qty, "has_price": has_price,
            }
        }     

    elif has_date and has_total:
        return {
            "combination"  : "combo_fallback",
            "charts" : ["revenue_line_chart"],
            "kpis"   : ["total_revenue", "best_month"],
            "flags": {
                "has_date": has_date, "has_category": has_category,
                "has_product": has_product, "has_total": has_total,
                "has_qty": has_qty, "has_price": has_price,
            }
        }

    return {
        "combination": "unknown",
        "charts": [],
        "kpis": [],
        "flags": {
            "has_date": has_date, "has_category": has_category,
            "has_product": has_product, "has_total": has_total,
            "has_qty": has_qty, "has_price": has_price,
        }
    }
