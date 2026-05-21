package com.digitalhut.observatory

import android.content.Context

object ObservatoryAssets {

    fun listAssets(
        context: Context
    ): List<String> {

        return context.assets
            .list("observatory")
            ?.filter {
                it.endsWith(".glb")
            }
            ?: emptyList()

    }

}
